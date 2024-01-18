import React, { useCallback, useEffect } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { getCommunityMapStats } from 'app/api/geojson-data';
import { appColors } from 'styles/theme/colors';
import { useMediaQuery } from 'utils/hooks/useMediaQuery';

export const CommunityMapLegend = () => {
  const [statsInfo, setStatsInfo] = React.useState<{
    slacklineGroupsCount: number;
    isaMembersCount: number;
    countryCount: number;
  }>({
    slacklineGroupsCount: 0,
    isaMembersCount: 0,
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
      const stats = await getCommunityMapStats();
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
        <Item
          color={appColors.slacklineGroupColor}
          label={`${statsInfo.slacklineGroupsCount} slackline groups`}
        />
        <Item
          color={appColors.isaMemberGroupColor}
          label={`${statsInfo.isaMembersCount} ISA Members & Partners`}
        />
        <Item color={appColors.countryColor} label={`${statsInfo.countryCount} countries`} />
      </Stack>
    </Box>
  );
};
