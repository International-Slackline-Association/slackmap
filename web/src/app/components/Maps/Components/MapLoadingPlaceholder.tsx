import { Box, Typography, darken } from '@mui/material';

import { appColors } from 'styles/theme/colors';

import { MAP_PADDING_RIGHT_FOR_FEATURE_CARD } from '../constants';

export const MapLoadingPlaceholder = (props: { pad?: boolean }) => {
  const rightPadding = props.pad ? `${MAP_PADDING_RIGHT_FOR_FEATURE_CARD}px` : undefined;
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        backgroundColor: darken(appColors.slackmapBlue, 0.9),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 10,
        paddingRight: rightPadding,
      }}
    >
      <img
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        src={'/images/slackmapLogo.png'}
        alt=""
      />
      <Typography variant="h6" sx={{ color: (t) => t.palette.primary.contrastText }}>
        Loading Map...
      </Typography>
    </Box>
  );
};
