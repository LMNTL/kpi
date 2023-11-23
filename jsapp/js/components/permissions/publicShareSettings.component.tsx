import React from 'react';
import Checkbox from 'js/components/common/checkbox';
import TextBox from 'js/components/common/textBox';
import {actions} from 'js/actions';
import bem from 'js/bem';
import permConfig from './permConfig';
import {ANON_USERNAME_URL} from 'js/users/utils';
import {ROOT_URL} from 'js/constants';
import type {PermissionCodename} from './permConstants';
import type {PermissionResponse} from 'jsapp/js/dataInterface';
import envStore from 'js/envStore';
import Icon from 'js/components/common/icon';

const HELP_ARTICLE_ANON_SUBMISSIONS_URL = 'managing_permissions.html';

interface PublicShareSettingsProps {
  publicPerms: PermissionResponse[];
  assetUid: string;
  deploymentActive: boolean;
}

class PublicShareSettings extends React.Component<PublicShareSettingsProps> {
  togglePerms(permCodename: PermissionCodename) {
    const permission = this.props.publicPerms.filter(
      (perm) =>
        perm.permission ===
        permConfig.getPermissionByCodename(permCodename)?.url
    )[0];
    if (permission) {
      actions.permissions.removeAssetPermission(
        this.props.assetUid,
        permission.url
      );
    } else {
      actions.permissions.assignAssetPermission(this.props.assetUid, {
        user: ANON_USERNAME_URL,
        permission: permConfig.getPermissionByCodename(permCodename)?.url,
      });
    }
  }

  render() {
    const uid = this.props.assetUid;
    const url = `${ROOT_URL}/#/forms/${uid}`;

    const anonCanViewPermUrl =
      permConfig.getPermissionByCodename('view_asset')?.url;
    const anonCanAddPermUrl =
      permConfig.getPermissionByCodename('add_submissions')?.url;
    const anonCanViewDataPermUrl =
      permConfig.getPermissionByCodename('view_submissions')?.url;

    const anonCanView = Boolean(
      this.props.publicPerms.filter(
        (perm) => perm.permission === anonCanViewPermUrl
      )[0]
    );
    const anonCanViewData = Boolean(
      this.props.publicPerms.filter(
        (perm) => perm.permission === anonCanViewDataPermUrl
      )[0]
    );
    const anonCanAddData = Boolean(
      this.props.publicPerms.filter(
        (perm) => perm.permission === anonCanAddPermUrl
      )[0]
    );

    return (
      <bem.FormModal__item m='permissions'>
        <bem.FormModal__item>
          <Checkbox
            checked={anonCanView}
            onChange={this.togglePerms.bind(this, 'view_asset')}
            label={t('Anyone can view this form')}
          />
        </bem.FormModal__item>

        <bem.FormModal__item m='anonymous-submissions'>
          <Checkbox
            checked={anonCanAddData}
            onChange={this.togglePerms.bind(this, 'add_submissions')}
            label={t('Allow anonymous submissions to this form')}
          />
          <a
            href={
              envStore.data.support_url + HELP_ARTICLE_ANON_SUBMISSIONS_URL
            }
            target='_blank'
            title={t(
              'Checking this box will allow anyone to see this blank form and add submissions.\n\nClick the icon to learn more.'
            )}
          >
            <Icon size='s' name='help' color='storm' />
          </a>
        </bem.FormModal__item>

        {this.props.deploymentActive && (
          <bem.FormModal__item>
            <Checkbox
              checked={anonCanViewData}
              onChange={this.togglePerms.bind(this, 'view_submissions')}
              label={t('Anyone can view submissions made to this form')}
            />
          </bem.FormModal__item>
        )}

        {anonCanView && (
          <TextBox
            label={t('Shareable link')}
            type='text'
            readOnly
            value={url}
          />
        )}
      </bem.FormModal__item>
    );
  }
}

export default PublicShareSettings;
