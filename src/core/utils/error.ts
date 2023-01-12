export const parseExpectedError = (err: Error) => {
  let status: number;
  let code: string;
  let errorMessage: string;
  let isExpectedError = false;

  const errMessageParts = err.message.split(':');
  if (errMessageParts.length === 0) {
    errorMessage = err.message;
  } else {
    errorMessage = errMessageParts.slice(1).join(':');
  }
  const errorPrefix = err.message.split(':')[0];

  switch (errorPrefix) {
    case 'Validation':
      status = 400;
      code = 'InvalidRequest';
      isExpectedError = true;
      break;
    case 'Forbidden':
      status = 403;
      code = 'Forbidden';
      isExpectedError = true;
      break;
    case 'NotFound':
      status = 404;
      code = 'NotFound';
      isExpectedError = true;
      break;
    default:
      status = 500;
      code = 'InternalError';
      errorMessage = err.message;
      isExpectedError = false;
      break;
  }
  return { status, code, isExpectedError, errorMessage: errorMessage.trim() };
};
