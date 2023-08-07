/**
 * A component with common layout elements for all routes.
 */

import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import {Outlet} from 'react-router-dom';
import reactMixin from 'react-mixin';
import Reflux from 'reflux';
import {stores} from 'js/stores';
import 'js/surveyCompanionStore'; // importing it so it exists
import {} from 'js/bemComponents'; // importing it so it exists
import bem from 'js/bem';
import mixins from 'js/mixins';
import MainHeader from 'js/components/header/mainHeader.component';
import Drawer from 'js/components/drawer';
import FormViewSideTabs from 'js/components/formViewSideTabs';
import ProjectTopTabs from 'js/project/projectTopTabs.component';
import PermValidator from 'js/components/permissions/permValidator';
import {assign} from 'utils';
import BigModal from 'js/components/bigModal/bigModal';
import {Toaster} from 'react-hot-toast';
import {withRouter, routerGetAssetId, router} from './router/legacy';
import {Tracking} from './router/useTracking';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = assign({
      pageState: stores.pageState.state,
    });
  }

  componentDidMount() {
    router.subscribe(this.onRouteChange.bind(this));
  }

  onRouteChange() {
    // slide out drawer overlay on every page change (better mobile experience)
    if (this.state.pageState.showFixedDrawer) {
      stores.pageState.setState({showFixedDrawer: false});
    }

    // hide modal on every page change
    if (this.state.pageState.modal) {
      stores.pageState.hideModal();
    }
  }

  render() {
    const assetid = routerGetAssetId();

    const pageWrapperContentModifiers = [];
    if (this.isFormSingle()) {
      pageWrapperContentModifiers.push('form-landing');
    }
    if (this.isLibrarySingle()) {
      pageWrapperContentModifiers.push('library-landing');
    }

    const pageWrapperModifiers = {
      'fixed-drawer': this.state.pageState.showFixedDrawer,
      'in-formbuilder': this.isFormBuilder(),
      'is-modal-visible': Boolean(this.state.pageState.modal),
    };

    if (typeof this.state.pageState.modal === 'object') {
      pageWrapperModifiers[
        `is-modal-${this.state.pageState.modal.type}`
      ] = true;
    }

    return (
      <DocumentTitle title='KoboToolbox'>
        <React.Fragment>
          <Tracking />
          <PermValidator />
          <div className='header-stretch-bg' />
          <bem.PageWrapper
            m={pageWrapperModifiers}
            className='mdl-layout mdl-layout--fixed-header'
          >
            {this.state.pageState.modal && (
              <BigModal params={this.state.pageState.modal} />
            )}

            {!this.isFormBuilder() && (
              <React.Fragment>
                <MainHeader assetUid={assetid} />
                <Drawer />
              </React.Fragment>
            )}

            <bem.PageWrapper__content
              className='mdl-layout__content'
              m={pageWrapperContentModifiers}
            >
              {!this.isFormBuilder() && (
                <React.Fragment>
                  {this.isFormSingle() && <ProjectTopTabs />}
                  <FormViewSideTabs show={this.isFormSingle()} />
                </React.Fragment>
              )}
              <Outlet />
            </bem.PageWrapper__content>
          </bem.PageWrapper>

          {/* Default position of all notifications, page specific ones can be overwritten */}
          <Toaster
            toastOptions={{
              // TODO: get colours from a single file: https://github.com/kobotoolbox/kobo-common/issues/1
              style: {
                borderRadius: '6px',
                padding: '16px',
                background: '#1e2129', // $kobo-gray-14
                color: '#fff', // $kobo-white
                maxHeight: '90vh',
                overflow: 'hidden',
              },
              success: {
                iconTheme: {
                  primary: '#96eb9e', // $kobo-green
                  secondary: '#1e2129', // $kobo-gray-14
                },
              },
              error: {
                iconTheme: {
                  primary: '#fe6b7d', // $kobo-red
                  secondary: '#1e2129', // $kobo-gray-14
                },
              },
              loading: {
                iconTheme: {
                  primary: '#979fb4', // $kobo-gray-65
                  secondary: '#1e2129', // $kobo-gray-14
                },
              },
              duration: 5000, // 5 seconds
            }}
          />
        </React.Fragment>
      </DocumentTitle>
    );
  }
}

App.contextTypes = {router: PropTypes.object};

reactMixin(App.prototype, Reflux.connect(stores.pageState, 'pageState'));
reactMixin(App.prototype, mixins.contextRouter);

export default withRouter(App);
