import React, {useState, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import type {
  ProjectsFilterDefinition,
  ProjectFieldName,
} from './projectViews/constants';
import ProjectsFilter from './projectViews/projectsFilter';
import ProjectsFieldsSelector from './projectViews/projectsFieldsSelector';
import {
  HOME_VIEW,
  HOME_ORDERABLE_FIELDS,
  HOME_DEFAULT_VISIBLE_FIELDS,
  HOME_EXCLUDED_FIELDS,
} from './projectViews/constants';
import ViewSwitcher from './projectViews/viewSwitcher';
import ProjectsTable from 'js/projects/projectsTable/projectsTable';
import customViewStore from './customViewStore';
import styles from './projectViews.module.scss';
import routeStyles from './myProjectsRoute.module.scss';
import {toJS} from 'mobx';
import {COMMON_QUERIES, ROOT_URL} from 'js/constants';
import ProjectQuickActionsEmpty from './projectsTable/projectQuickActionsEmpty';
import ProjectQuickActions from './projectsTable/projectQuickActions';
import ProjectBulkActions from './projectsTable/projectBulkActions';
import Dropzone from 'react-dropzone';
import {validFileTypes} from 'js/utils';
import Icon from 'js/components/common/icon';
import {dropImportXLSForms} from 'js/dropzone.utils';
import LimitModal from '../components/usageLimits/overLimitModal.component';
import LimitBanner from '../components/usageLimits/overLimitBanner.component';
import {Cookies} from 'react-cookie';
import envStore from 'js/envStore';
import {
  getAllExceedingLimits,
  getPlanInterval,
} from 'js/components/usageLimits/usageCalculations';

const cookies = new Cookies();

function MyProjectsRoute() {
  const [customView] = useState(customViewStore);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const limits = getAllExceedingLimits();
  const interval = getPlanInterval();

  useEffect(() => {
    customView.setUp(
      HOME_VIEW.uid,
      `${ROOT_URL}/api/v2/assets/?q=${COMMON_QUERIES.s}`,
      HOME_DEFAULT_VISIBLE_FIELDS
    );
  }, []);

  useEffect(() => {
    const limitsCookie = cookies.get('kpiOverLimitsCookie');
    if (limitsCookie === undefined && limits.exceedList.length > 0) {
      setShowModal(true);
      const dateNow = new Date();
      const expireDate = new Date(dateNow.setDate(dateNow.getDate() + 1));
      cookies.set('kpiOverLimitsCookie', {
        expires: expireDate,
      });
    }
    if (limitsCookie && limits.exceedList.length) {
      setDismissed(true);
    }
  }, [limits]);

  const modalDismissed = (dismiss: boolean) => {
    setDismissed(dismiss);
  };

  /** Returns a list of names for fields that have at least 1 filter defined. */
  const getFilteredFieldsNames = () => {
    const outcome: ProjectFieldName[] = [];
    customView.filters.forEach((item: ProjectsFilterDefinition) => {
      if (item.fieldName !== undefined) {
        outcome.push(item.fieldName);
      }
    });
    return outcome;
  };

  const selectedAssets = customView.assets.filter((asset) =>
    selectedRows.includes(asset.uid)
  );

  /** Filters out excluded fields */
  const getTableVisibleFields = () => {
    const outcome = toJS(customView.fields) || customView.defaultVisibleFields;
    return outcome.filter(
      (fieldName) => !HOME_EXCLUDED_FIELDS.includes(fieldName)
    );
  };

  return (
    <Dropzone
      onDrop={dropImportXLSForms}
      disableClick
      multiple
      className={routeStyles.dropzone}
      activeClassName={routeStyles.dropzoneActive}
      accept={validFileTypes()}
    >
      <div className={routeStyles.dropzoneOverlay}>
        <Icon name='upload' size='xl' />
        <h1>{t('Drop files to upload')}</h1>
      </div>

      <section className={styles.root}>
        <header className={styles.header}>
          <ViewSwitcher selectedViewUid={HOME_VIEW.uid} />

          <ProjectsFilter
            onFiltersChange={customView.setFilters.bind(customView)}
            filters={toJS(customView.filters)}
            excludedFields={HOME_EXCLUDED_FIELDS}
          />

          <ProjectsFieldsSelector
            onFieldsChange={customView.setFields.bind(customView)}
            selectedFields={toJS(customView.fields)}
            excludedFields={HOME_EXCLUDED_FIELDS}
          />

          {selectedAssets.length === 0 && (
            <div className={styles.actions}>
              <ProjectQuickActionsEmpty />
            </div>
          )}

          {selectedAssets.length === 1 && (
            <div className={styles.actions}>
              <ProjectQuickActions asset={selectedAssets[0]} />
            </div>
          )}

          {selectedAssets.length > 1 && (
            <div className={styles.actions}>
              <ProjectBulkActions assets={selectedAssets} />
            </div>
          )}
        </header>
        {dismissed && (
          <LimitBanner interval={interval} limits={limits.exceedList} />
        )}
        <LimitBanner warning interval={interval} limits={limits.warningList} />
        {envStore.data.stripe_public_key !== null && (
          <LimitModal
            show={showModal}
            limits={limits.exceedList}
            interval={interval}
            dismissed={(dismiss) => modalDismissed(dismiss)}
          />
        )}
        <ProjectsTable
          assets={customView.assets}
          isLoading={!customView.isFirstLoadComplete}
          highlightedFields={getFilteredFieldsNames()}
          visibleFields={getTableVisibleFields()}
          orderableFields={HOME_ORDERABLE_FIELDS}
          order={customView.order}
          onChangeOrderRequested={customView.setOrder.bind(customView)}
          onHideFieldRequested={customView.hideField.bind(customView)}
          onRequestLoadNextPage={customView.fetchMoreAssets.bind(customView)}
          hasMorePages={customView.hasMoreAssets}
          selectedRows={selectedRows}
          onRowsSelected={setSelectedRows}
        />
      </section>
    </Dropzone>
  );
}

export default observer(MyProjectsRoute);
