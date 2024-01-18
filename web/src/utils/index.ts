import { appActions } from 'app/slices/app';

export function showSuccessNotification(message: string) {
  return appActions.updateSnackbarNotification({
    message: message,
    severity: 'success',
  });
}

export function showErrorNotification(message: string) {
  return appActions.updateSnackbarNotification({
    message: message,
    severity: 'error',
  });
}

export function showWarningNotification(message: string) {
  return appActions.updateSnackbarNotification({
    message: message,
    severity: 'warning',
  });
}

export function showInfoNotification(message: string, duration?: number) {
  return appActions.updateSnackbarNotification({
    message: message,
    severity: 'info',
    duration,
  });
}

export const imageUrlFromS3Key = (s3Key?: string) => {
  if (!s3Key) {
    return undefined;
  }
  return `https://images.slackmap.com/${s3Key}`;
};

export const trimString = (str?: string, maxLength?: number) => {
  if (!str) {
    return '';
  }
  if (!maxLength) {
    return str;
  }
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.substring(0, maxLength)}...`;
};
