import logging

from celery.signals import task_failure, task_retry
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models.signals import post_delete
from django_celery_beat.models import PeriodicTasks, PeriodicTask
from requests.exceptions import HTTPError

from kobo.apps.trackers.models import MonthlyNLPUsageCounter
from kobo.apps.audit_log.models import AuditLog, AuditMethod
from kobo.celery import celery_app
from kpi.deployment_backends.kc_access.utils import delete_kc_user
from kpi.models.asset import Asset
from .exceptions import TrashTaskInProgressError, TrashKobocatNotResponsiveError
from .models import TrashStatus
from .models.account import AccountTrash
from .models.project import ProjectTrash
from .utils import delete_project


@celery_app.task(
    autoretry_for=(TrashTaskInProgressError, TrashKobocatNotResponsiveError,),
    retry_backoff=60,
    retry_backoff_max=600,
    max_retries=5,
    retry_jitter=False,
)
def empty_account(account_trash_id: int):
    with transaction.atomic():
        account_trash = AccountTrash.objects.select_for_update().get(
            pk=account_trash_id
        )
        if account_trash.status == TrashStatus.IN_PROGRESS:
            logging.warning(
                f'User {account_trash.user.username} deletion is already '
                f'in progress'
            )
            return

        assets = Asset.all_objects.filter(owner=account_trash.user).only(
            'uid', '_deployment_data', 'name', 'asset_type', 'advanced_features'
        )

        # Ensure there are no running other project trash tasks related to this
        # account
        if ProjectTrash.objects.filter(
            asset__in=assets, status=TrashStatus.IN_PROGRESS
        ).exists():
            # Let them finish and retry later
            raise TrashTaskInProgressError

        account_trash.status = TrashStatus.IN_PROGRESS
        account_trash.metadata['failure_error'] = ''
        account_trash.save(update_fields=['metadata', 'status'])

    for asset in assets:
        delete_project(account_trash.request_author, asset)

    user = account_trash.user
    user_id = user.pk
    date_deactivated = user.extra_details.date_deactivated
    try:
        # We need to deactivate this post_delete signal because it's triggered
        # on `User` delete cascade and fails to insert into DB within a transaction.
        # The post_delete signal occurs before user is deleted, therefore still
        # has a reference of it when the whole transaction is committed.
        # It fails with an IntegrityError.
        post_delete.disconnect(
            MonthlyNLPUsageCounter.update_catch_all_counters_on_delete,
            sender=MonthlyNLPUsageCounter,
            dispatch_uid='update_catch_all_monthly_xform_submission_counters',
        )
        with transaction.atomic():
            user.delete()
            try:
                delete_kc_user(user.username)
            except HTTPError as e:
                error = str(e)
                if error.startswith(('502', '504',)):
                    raise TrashKobocatNotResponsiveError
                if not error.startswith('404'):
                    raise e

            audit_log_params = {
                'app_label': get_user_model()._meta.app_label,
                'model_name': get_user_model()._meta.model_name,
                'object_id': user_id,
                'user': account_trash.request_author,
                'metadata': {
                    'username': user.username,
                }
            }

            if not account_trash.delete_all:
                # Recreate a user with same username to block any future
                # registration with the same username.
                user.set_password(get_user_model().objects.make_random_password())
                user.save()
                user.extra_details.date_deactivated = date_deactivated
                user.extra_details.save(update_fields=['date_deactivated'])
                audit_log_params['method'] = AuditMethod.SOFT_DELETE

            AuditLog.objects.create(**audit_log_params)

    finally:
        post_delete.connect(
            MonthlyNLPUsageCounter.update_catch_all_counters_on_delete,
            sender=MonthlyNLPUsageCounter,
            dispatch_uid='update_catch_all_monthly_xform_submission_counters',
        )

    # Delete related periodic task
    PeriodicTask.objects.get(pk=account_trash.periodic_task_id).delete()
    logging.info(f'User {user.username} (#{user_id}) has been successfully deleted!')


@celery_app.task
def empty_project(project_trash_id: int):
    with transaction.atomic():
        project_trash = ProjectTrash.objects.select_for_update().get(
            pk=project_trash_id
        )
        if project_trash.status == TrashStatus.IN_PROGRESS:
            logging.warning(
                f'Project {project_trash.asset.name} deletion is already '
                f'in progress'
            )
            return

        project_trash.status = TrashStatus.IN_PROGRESS
        project_trash.save(update_fields=['status'])

    delete_project(project_trash.request_author, project_trash.asset)


@task_failure.connect(sender=empty_account)
def empty_account_failure(sender=None, **kwargs):

    # Force scheduler to refresh
    PeriodicTasks.update_changed()

    exception = kwargs['exception']
    account_trash_id = kwargs['args'][0]
    with transaction.atomic():
        account_trash = AccountTrash.objects.select_for_update().get(
            pk=account_trash_id
        )
        account_trash.metadata['failure_error'] = str(exception)
        account_trash.status = TrashStatus.FAILED
        account_trash.save(update_fields=['status', 'metadata'])


@task_retry.connect(sender=empty_account)
def empty_account_retry(sender=None, **kwargs):
    account_trash_id = kwargs['request'].get('args')[0]
    exception = str(kwargs['reason'])
    with transaction.atomic():
        account_trash = AccountTrash.objects.select_for_update().get(
            pk=account_trash_id
        )
        account_trash.metadata['failure_error'] = str(exception)
        account_trash.status = TrashStatus.RETRY
        account_trash.save(update_fields=['status', 'metadata'])


@task_failure.connect(sender=empty_project)
def empty_project_failure(sender=None, **kwargs):

    # Force scheduler to refresh
    PeriodicTasks.update_changed()

    exception = kwargs['exception']
    project_trash_id = kwargs['args'][0]
    with transaction.atomic():
        project_trash = ProjectTrash.objects.select_for_update().get(
            pk=project_trash_id
        )
        project_trash.metadata['failure_error'] = str(exception)
        project_trash.status = TrashStatus.FAILED
        project_trash.save(update_fields=['status', 'metadata'])


@task_retry.connect(sender=empty_project)
def empty_project_retry(sender=None, **kwargs):
    project_trash_id = kwargs['request'].get('args')[0]
    exception = str(kwargs['reason'])
    with transaction.atomic():
        project_trash = AccountTrash.objects.select_for_update().get(
            pk=project_trash_id
        )
        project_trash.metadata['failure_error'] = str(exception)
        project_trash.status = TrashStatus.RETRY
        project_trash.save(update_fields=['status', 'metadata'])


@celery_app.task
def garbage_collector():
    # Do something with IN_progress for more than X hours
    # Delete complete
    pass
