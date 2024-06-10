import AnchorIcon from '@mui/icons-material/Anchor';
import CallIcon from '@mui/icons-material/Call';
import DescriptionIcon from '@mui/icons-material/Description';
import HikingIcon from '@mui/icons-material/Hiking';
import InfoIcon from '@mui/icons-material/Info';
import LuggageIcon from '@mui/icons-material/Luggage';
import { Typography } from '@mui/material';

import { trimString } from 'utils';

import { FeatureDetailFieldLayout } from './DetailFieldLayout';

interface Props {
  header: string;
  content?: string;
  skipIfEmpty?: boolean;
  trimLength?: number;
  infoType: 'description' | 'anchors' | 'access' | 'gear' | 'contact' | 'additional';
}

const getIcon = (infoType?: Props['infoType']) => {
  switch (infoType) {
    case 'description':
      return <DescriptionIcon fontSize="small" />;
    case 'anchors':
      return <AnchorIcon fontSize="small" />;
    case 'access':
      return <HikingIcon fontSize="small" />;
    case 'gear':
      return <LuggageIcon fontSize="small" />;
    case 'contact':
      return <CallIcon fontSize="small" />;
    case 'additional':
      return <InfoIcon fontSize="small" />;
    default:
      return null;
  }
};

export const FeatureDetailInfoField = (props: Props) => {
  if (props.skipIfEmpty && !props.content) {
    return null;
  }
  const content = trimString(props.content, props.trimLength);

  const icon = getIcon(props.infoType);
  return (
    <FeatureDetailFieldLayout icon={icon} header={props.header}>
      <Typography
        variant="body2"
        color={(t) => t.palette.text.secondary}
        sx={{
          whiteSpace: 'pre-line',
        }}
      >
        {content}
      </Typography>
    </FeatureDetailFieldLayout>
  );
};
