import { FC } from 'react';
import { FallbackProps, withErrorBoundary } from 'react-error-boundary';

import { Alert, Backdrop, Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { recordAnalyticsError } from 'utils/analytics';

function ErrorBoundyFallBack({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Backdrop
      sx={{ p: 2 }}
      open={true}
      onClick={() => {
        resetErrorBoundary();
      }}
    >
      <Alert severity="error" sx={{ alignItems: 'center' }}>
        <Stack spacing={2}>
          <Typography variant="body2Bold">An unexpected error occured in your browser</Typography>
          <Typography variant="body2">
            We have been notified of the error and will investigate it as soon as possible. <br />
            Write to <b>slackmap@slacklineinternational.org</b> if you need help.
          </Typography>
          <Typography variant="body2">
            <b>Error message: </b>
            {error.message}
          </Typography>
        </Stack>
      </Alert>
    </Backdrop>
  );
}

export function withErrorBoundry<P extends object>(Component: FC<P>) {
  return withErrorBoundary(Component, {
    FallbackComponent: ErrorBoundyFallBack,
    onError(error) {
      console.log('Error: ', error);
      error.message = 'React Error: ' + error.message;
      recordAnalyticsError(error);
    },
  });
}
