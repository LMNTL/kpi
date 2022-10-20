import React, {Suspense} from 'react';
import autoBind from 'react-autobind';
import {Form, Navigate, Routes} from 'react-router-dom';
import App from 'js/app';
import {FormPage, LibraryAssetEditor} from 'js/components/formEditors';
import {actions} from 'js/actions';
import {stores} from 'js/stores';
import {envStore} from 'js/envStore'; // initializing it
import MyLibraryRoute from 'js/components/library/myLibraryRoute';
import PublicCollectionsRoute from 'js/components/library/publicCollectionsRoute';
import AssetRoute from 'js/components/library/assetRoute';
import AccountSettings from 'js/components/account/accountSettingsRoute';
import DataStorage from 'js/components/account/dataStorageRoute';
import SecurityRoute from 'js/components/account/securityRoute';
import PlanRoute from 'js/components/account/planRoute';
import FormsSearchableList from 'js/lists/forms';
import {ROUTES} from 'js/router/routerConstants';
import permConfig from 'js/components/permissions/permConfig';
import LoadingSpinner from 'js/components/common/loadingSpinner';
import {isRootRoute, redirectToLogin} from 'js/router/routerUtils';
import RequireAuth from 'js/router/requireAuth';
import PermProtectedRoute from 'js/router/permProtectedRoute';
import {PERMISSIONS_CODENAMES} from 'js/constants';
import {Tracking} from './useTracking';

// Workaround https://github.com/remix-run/react-router/issues/8139
import {unstable_HistoryRouter as HistoryRouter, Route} from 'react-router-dom';
import {createHashHistory} from 'history';
const history = createHashHistory({window});

const Reports = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/reports/reports')
);
const FormLanding = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/formLanding')
);
const FormSummary = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/formSummary')
);
const FormSubScreens = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/formSubScreens')
);
const ChangePassword = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/changePassword')
);
const FormXform = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/formXform')
);
const FormJson = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/formJson')
);
const SectionNotFound = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/sectionNotFound')
);
const FormNotFound = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'js/components/formNotFound')
);

export default class AllRoutes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPermsConfigReady: permConfig.isReady(),
      isSessionReady: stores.session.isAuthStateKnown,
    };
    autoBind(this);
  }

  componentDidMount() {
    actions.permissions.getConfig.completed.listen(this.onGetConfigCompleted);
    stores.session.listen(this.onSessionChange);
    actions.permissions.getConfig();
  }

  onGetConfigCompleted(response) {
    permConfig.setPermissions(response.results);
    this.setReady({isPermsConfigReady: permConfig.isReady()});
  }

  onSessionChange() {
    this.setReady({isSessionReady: stores.session.isAuthStateKnown});
  }

  /**
   * This convoluted function wants to check if redirect should be made before
   * setting the state - which would cause an unwanted rerender.
   *
   * @param {object} data
   * @param {boolean} [data.isPermsConfigReady]
   * @param {boolean} [data.isSessionReady]
   */
  setReady(data) {
    const newStateObj = {
      isPermsConfigReady: this.state.isPermsConfigReady,
      isSessionReady: this.state.isSessionReady,
    };

    if (typeof data.isPermsConfigReady !== 'undefined') {
      newStateObj.isPermsConfigReady = data.isPermsConfigReady;
    }

    if (typeof data.isSessionReady !== 'undefined') {
      newStateObj.isSessionReady = data.isSessionReady;
    }

    if (
      newStateObj.isPermsConfigReady &&
      newStateObj.isSessionReady &&
      !stores.session.isLoggedIn &&
      isRootRoute()
    ) {
      // If all necessary data is obtained, and user is not logged in, and on
      // the root route, redirect immediately to the login page outside
      // the React app, and skip setting the state (so no content blink).
      redirectToLogin();
    } else {
      this.setState(newStateObj);
    }
  }

  render() {
    // This is the place that stops any app rendering until all necessary
    // backend calls are done.
    if (!this.state.isPermsConfigReady || !this.state.isSessionReady) {
      return <LoadingSpinner />;
    }

    const isLoggedIn = stores.session.isLoggedIn;

    return (
      <HistoryRouter history={history}>
        <Tracking />
        <Routes>
          <Route path={ROUTES.ROOT} element={<App />}>
            <Route path='' element={<Navigate to={ROUTES.FORMS} replace />} />
            <Route path={ROUTES.SECURITY} element={<SecurityRoute />} />
            <Route path={ROUTES.PLAN} element={<PlanRoute />} />
            <Route path={ROUTES.DATA_STORAGE} element={<DataStorage />} />
            <Route
              path={ROUTES.ACCOUNT_SETTINGS}
              element={
                <RequireAuth>
                  <AccountSettings />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.CHANGE_PASSWORD}
              element={
                <RequireAuth>
                  <ChangePassword />
                </RequireAuth>
              }
            />
            <Route path={ROUTES.LIBRARY}>
              <Route path='' element={<Navigate to={ROUTES.MY_LIBRARY} />} />
              <Route
                path={ROUTES.MY_LIBRARY}
                element={
                  <RequireAuth>
                    <MyLibraryRoute />
                  </RequireAuth>
                }
              />
              <Route
                path={ROUTES.PUBLIC_COLLECTIONS}
                element={
                  <RequireAuth>
                    <PublicCollectionsRoute />
                  </RequireAuth>
                }
              />
              <Route
                path={ROUTES.NEW_LIBRARY_ITEM}
                element={
                  <RequireAuth>
                    <LibraryAssetEditor />
                  </RequireAuth>
                }
              />
              <Route
                path={ROUTES.LIBRARY_ITEM}
                component={PermProtectedRoute}
                element={AssetRoute}
                requiredPermission={PERMISSIONS_CODENAMES.view_asset}
              />
              <Route
                path={ROUTES.EDIT_LIBRARY_ITEM}
                component={PermProtectedRoute}
                element={LibraryAssetEditor}
                requiredPermission={PERMISSIONS_CODENAMES.change_asset}
              />
              <Route
                path={ROUTES.NEW_LIBRARY_CHILD}
                component={PermProtectedRoute}
                element={LibraryAssetEditor}
                requiredPermission={PERMISSIONS_CODENAMES.change_asset}
              />
              <Route
                path={ROUTES.LIBRARY_ITEM_JSON}
                component={PermProtectedRoute}
                element={FormJson}
                requiredPermission={PERMISSIONS_CODENAMES.view_asset}
              />
              <Route
                path={ROUTES.LIBRARY_ITEM_XFORM}
                component={PermProtectedRoute}
                element={FormXform}
                requiredPermission={PERMISSIONS_CODENAMES.view_asset}
              />
            </Route>
            <Route path={ROUTES.FORMS}>
              <Route
                index
                element={
                  <RequireAuth>
                    <FormsSearchableList />
                  </RequireAuth>
                }
              />
              <Route path={ROUTES.FORM}>
                <Route
                  path=''
                  element={<Navigate to={'./landing'} replace />}
                />

                <Route
                  path={ROUTES.FORM_SUMMARY}
                  component={PermProtectedRoute}
                  protectedComponent={FormSummary}
                  requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                />

                <Route
                  path={ROUTES.FORM_LANDING}
                  element={
                    <PermProtectedRoute
                      requiredPermission={PERMISSIONS_CODENAMES.view_asset}
                      protectedComponent={FormLanding}
                    />
                  }
                />

                <Route path={ROUTES.FORM_DATA}>
                  <Route
                    path=''
                    element={<Navigate to={ROUTES.FORM_TABLE} />}
                  />
                  <Route
                    path={ROUTES.FORM_REPORT}
                    component={PermProtectedRoute}
                    protectedComponent={Reports}
                    requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                  />
                  <Route
                    path={ROUTES.FORM_REPORT_OLD}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                  />
                  <Route
                    path={ROUTES.FORM_TABLE}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                  />
                  <Route
                    path={ROUTES.FORM_DOWNLOADS}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                  />
                  <Route
                    path={ROUTES.FORM_GALLERY}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                  />
                  <Route
                    path={ROUTES.FORM_MAP}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                  />
                  <Route
                    path={ROUTES.FORM_MAP_BY}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                  />
                </Route>

                <Route path={ROUTES.FORM_SETTINGS}>
                  <Route
                    index
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.manage_asset}
                  />
                  <Route
                    path={ROUTES.FORM_MEDIA}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.manage_asset}
                  />
                  <Route
                    path={ROUTES.FORM_SHARING}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.manage_asset}
                  />
                  <Route
                    path={ROUTES.FORM_RECORDS}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.manage_asset}
                  />
                  <Route
                    path={ROUTES.FORM_REST}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.manage_asset}
                  />
                  <Route
                    path={ROUTES.FORM_REST_HOOK}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.manage_asset}
                  />
                  <Route
                    path={ROUTES.FORM_KOBOCAT}
                    component={PermProtectedRoute}
                    protectedComponent={FormSubScreens}
                    requiredPermission={PERMISSIONS_CODENAMES.manage_asset}
                  />
                </Route>

                <Route
                  path={ROUTES.FORM_JSON}
                  component={PermProtectedRoute}
                  protectedComponent={FormJson}
                  requiredPermission={PERMISSIONS_CODENAMES.view_asset}
                />
                <Route
                  path={ROUTES.FORM_XFORM}
                  component={PermProtectedRoute}
                  protectedComponent={FormXform}
                  requiredPermission={PERMISSIONS_CODENAMES.view_asset}
                />
                <Route
                  path={ROUTES.FORM_EDIT}
                  component={PermProtectedRoute}
                  protectedComponent={FormPage}
                  requiredPermission={PERMISSIONS_CODENAMES.view_asset}
                />
                {/**
                 * TODO change this HACKFIX to a better solution
                 *
                 * Used to force refresh form sub routes. It's some kine of a weird
                 * way of introducing a loading screen during sub route refresh.
                 * See: https://github.com/kobotoolbox/kpi/issues/3925
                 **/}
                <Route
                  path={ROUTES.FORM_RESET}
                  component={PermProtectedRoute}
                  protectedComponent={FormSubScreens}
                  requiredPermission={PERMISSIONS_CODENAMES.view_submissions}
                />
              </Route>
              <Route path='*' component={FormNotFound} />
            </Route>
            <Route
              path='*'
              element={
                <Suspense fallback={null}>
                  <SectionNotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </HistoryRouter>
    );
  }
}
