import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Slide, SlideProps, Snackbar } from '@mui/material';

import { appActions } from 'app/slices/app';
import { selectSnackbarNotification } from 'app/slices/app/selectors';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

const NotificationSnackbar = () => {
  const dispatch = useDispatch();
  const snackbarNotification = useSelector(selectSnackbarNotification);
  const [lastSnackbarNotification, setLastSnackbarNotification] = useState(snackbarNotification);

  useEffect(() => {
    if (snackbarNotification) {
      setLastSnackbarNotification(snackbarNotification);
    }
  }, [snackbarNotification]);

  const onClose = () => {
    dispatch(appActions.updateSnackbarNotification(null));
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={Boolean(snackbarNotification)}
      autoHideDuration={snackbarNotification?.duration ?? 3000}
      onClose={onClose}
      TransitionComponent={SlideTransition}
    >
      <Alert
        elevation={6}
        variant="filled"
        onClose={onClose}
        severity={lastSnackbarNotification?.severity}
      >
        {lastSnackbarNotification?.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
