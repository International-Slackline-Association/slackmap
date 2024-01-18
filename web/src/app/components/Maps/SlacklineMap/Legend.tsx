import React, { useCallback, useEffect } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { getSlacklineMapStats } from 'app/api/geojson-data';
import { appColors } from 'styles/theme/colors';
import { useMediaQuery } from 'utils/hooks/useMediaQuery';

export const SlacklineMapLegend = () => {
  const [statsInfo, setStatsInfo] = React.useState<{
    lineCount: number;
    spotCount: number;
    guideCount: number;
    countryCount: number;
  }>({
    lineCount: 0,
    spotCount: 0,
    guideCount: 0,
    countryCount: 0,
  });

  const { isDesktop } = useMediaQuery();

  const Item = useCallback(
    (props: { color: string; label: string }) => {
      return (
        <Stack spacing={0.5} direction={'row'} alignItems={'center'}>
          <Box
            sx={{
              width: isDesktop ? '10px' : '5px',
              height: isDesktop ? '10px' : '5px',
              bgcolor: props.color,
              borderRadius: '50%',
            }}
          />
          <Typography variant={'body2'} fontSize={isDesktop ? '0.7rem' : '0.6rem'}>
            {props.label}
          </Typography>
        </Stack>
      );
    },
    [isDesktop],
  );
  useEffect(() => {
    const loadStats = async () => {
      const stats = await getSlacklineMapStats();
      setStatsInfo(stats);
    };
    loadStats();
  }, [setStatsInfo]);

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 4,
        width: '100%',
        bottom: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        display: 'flex',
        pointerEvents: 'none',
        color: (t) => t.palette.primary.contrastText,
      }}
    >
      <Stack spacing={1} direction={'row'} alignItems={'center'}>
        <Item color={appColors.lineStrokeColor} label={`${statsInfo.lineCount} lines`} />
        <Item color={appColors.spotFillColor} label={`${statsInfo.spotCount} spots`} />
        <Item
          color={appColors.guideFeaturesColor}
          label={`${statsInfo.guideCount} access guides`}
        />
        <Item color={appColors.countryColor} label={`${statsInfo.countryCount} countries`} />
      </Stack>
    </Box>
  );
};
