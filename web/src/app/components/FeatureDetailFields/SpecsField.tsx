import StraightenIcon from '@mui/icons-material/Straighten';
import { Stack, Typography } from '@mui/material';

import { FeatureDetailFieldLayout } from './DetailFieldLayout';

interface Props {
  content: { label: string; value: string }[];
  isAccurate?: boolean;
}

export const FeatureDetailSpecsField = (props: Props) => {
  const infoText = props.isAccurate ? (
    <Typography variant="body2" color={(t) => t.palette.success.main}>
      Measured ✓
    </Typography>
  ) : (
    <Typography variant="body2" color={(t) => t.palette.warning.main}>
      Not Measured
    </Typography>
  );

  return (
    <FeatureDetailFieldLayout
      icon={<StraightenIcon fontSize="small" />}
      header={
        <Stack spacing={1} direction={'row'} alignItems="center">
          <Typography variant="body2Bold">Specs</Typography>
          {infoText}
        </Stack>
      }
    >
      {props.content.map((c) => (
        <Typography key={c.label} variant="body2" color={(t) => t.palette.text.secondary}>
          {c.label}: <b>{c.value}</b>
        </Typography>
      ))}
    </FeatureDetailFieldLayout>
  );
};
