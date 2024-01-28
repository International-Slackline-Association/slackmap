import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';

import NotificationSnackbar from 'app/components/NotificationSnackbar';
import { appActions, useAppSlice } from 'app/slices/app';
import {
  selectAuthState,
  selectIsUserSignedIn,
  selectSnackbarNotification,
} from 'app/slices/app/selectors';
import { AuthState } from 'app/slices/app/types';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

import { AppDrawer } from './components/AppDrawer';
import { withErrorBoundry } from './components/ErrorBoundary';
import { CommunitiesPage } from './pages/Communities/Loadable';
import { CreateGuidePage } from './pages/Create/Guide/Loadable';
import { CreateLinePage } from './pages/Create/Line/Loadable';
import { CreateSpotPage } from './pages/Create/Spot/Loadable';
import { GuideEditPage } from './pages/Guide/GuideEditPage/Loadable';
import { LegacyDetailPage } from './pages/LegacyDetailPage/Loadable';
import { LineEditPage } from './pages/Line/LineEditPage/Loadable';
import { SlacklineMapPage } from './pages/SlacklineMap/Loadable';
import { SpotEditPage } from './pages/Spot/SpotEditPage/Loadable';

export function App() {
  useAppSlice();

  const dispatch = useDispatch();

  const authState = useSelector(selectAuthState);
  const isSignedIn = useSelector(selectIsUserSignedIn);
  const snackbarNotification = useSelector(selectSnackbarNotification);

  useEffect(() => {
    Hub.listen('auth', async ({ payload: { event } }) => {
      switch (event) {
        case 'signedIn':
          dispatch(appActions.updateAuthState(AuthState.SignedIn));
          break;
        case 'signedOut':
          dispatch(appActions.updateAuthState(AuthState.SignedOut));
          break;

        default:
          break;
      }
    });
    getCurrentUser()
      .then(async () => {
        dispatch(appActions.updateAuthState(AuthState.SignedIn));
      })
      .catch(() => dispatch(appActions.updateAuthState(AuthState.SigningOut)));
  }, [dispatch]);

  useEffect(() => {
    if (authState === AuthState.SigningOut) {
      signOut();
    }
  }, [authState, dispatch]);

  const onSnackbarClose = () => {
    dispatch(appActions.updateSnackbarNotification(null));
  };

  return (
    <BrowserRouter>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            fontFamily: 'Lato',
            height: '100%',
            width: '100%',
          },
        }}
      />
      <AppDrawer>
        <Routes>
          <Route path="/" element={<SlacklineMapPage />} />
          <Route path="/line/:lineId" element={<SlacklineMapPage />} />
          <Route path="/spot/:spotId" element={<SlacklineMapPage />} />
          <Route path="/guide/:guideId" element={<SlacklineMapPage />} />
          <Route path="/country/:countryCode" element={<SlacklineMapPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/communities/group/:groupId" element={<CommunitiesPage />} />
          <Route path="/communities/country/:countryCode" element={<CommunitiesPage />} />
          {isSignedIn && (
            <>
              <Route path="/create/line" element={<CreateLinePage />} />
              <Route path="/line/:lineId/edit" element={<LineEditPage />} />
              <Route path="/create/spot" element={<CreateSpotPage />} />
              <Route path="/spot/:spotId/edit" element={<SpotEditPage />} />
              <Route path="/create/guide" element={<CreateGuidePage />} />
              <Route path="/guide/:guideId/edit" element={<GuideEditPage />} />
            </>
          )}
          <Route path="/x/:legacyId" element={<LegacyDetailPage />} />
          <Route path="*" element={<SlacklineMapPage />} />
        </Routes>
      </AppDrawer>

      <NotificationSnackbar snackbarNotification={snackbarNotification} onClose={onSnackbarClose} />
    </BrowserRouter>
  );
}

export default withErrorBoundry(App);
