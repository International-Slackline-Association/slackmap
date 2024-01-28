import { Alert, AlertColor, AlertTitle, Box } from '@mui/material';

import { SlacklineRestrictionLevel } from '@server/core/types';
import { trimString } from 'utils';

interface Props {
  level?: SlacklineRestrictionLevel;
  restrictionInfo?: string;
  trimLength?: number;
}

export const FeatureDetailRestrictionField = (props: Props) => {
  let severity: AlertColor | undefined;
  let warningText: string | undefined;
  if (!props.level) {
    return null;
  }
  switch (props.level) {
    case 'partial':
      severity = 'warning';
      warningText = 'Partially Restricted Access';
      break;
    case 'full':
      severity = 'error';
      warningText = 'FULLY Restricted Access';
      break;
    default:
      break;
  }
  if (!severity) {
    return null;
  }
  return (
    <Box>
      <Alert severity={severity} variant="outlined">
        <AlertTitle>Warning - {warningText}</AlertTitle>
        {trimString(props.restrictionInfo, props.trimLength)}
      </Alert>
    </Box>
  );
};
