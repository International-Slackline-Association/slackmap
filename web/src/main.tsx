import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@mui/material';

import { amplifyConfig } from 'amplifyConfig';
import App from 'app';
import { Amplify } from 'aws-amplify';
import { ConfirmProvider } from 'material-ui-confirm';
import { configureAppStore } from 'store';
import { initAnalytics } from 'utils/analytics';

import { theme } from './styles/theme';

const store = configureAppStore();

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

Amplify.configure(amplifyConfig);
initAnalytics();

root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <HelmetProvider>
          <StrictMode>
            <App />
          </StrictMode>
        </HelmetProvider>
      </ConfirmProvider>
    </ThemeProvider>
  </Provider>,
);
