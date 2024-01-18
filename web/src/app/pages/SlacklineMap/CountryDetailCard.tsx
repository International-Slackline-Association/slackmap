import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PentagonIcon from '@mui/icons-material/Pentagon';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Divider, Menu, MenuItem, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';

import { countryApi } from 'app/api/country-api';
import { getSlacklinePointFeaturesOfCountry } from 'app/api/geojson-data';
import { SlacklineFeatureIcon } from 'app/components/Icons/SlacklineFeatureIcon';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { appColors } from 'styles/theme/colors';

import { CountryHistoryField } from '../../components/FeatureDetailFields/CountryHistoryField';
import { FeatureDetailFieldLayout } from '../../components/FeatureDetailFields/DetailFieldLayout';

interface Props {
  countryCode: string;
  onChangelogClick: (featureId: string, featureType: SlacklineMapFeatureType) => void;
  onChangelogHover: (featureId?: string, featureType?: SlacklineMapFeatureType) => void;
}

export const CountryDetailCard = (props: Props) => {
  const navigate = useNavigate();
  const cardHeaderPopupState = usePopupState({
    variant: 'popover',
    popupId: 'cardHeaderMenu',
  });
  const dispatch = useDispatch();

  const [statsInfo, setStatsInfo] = React.useState<{
    lineCount: number;
    spotCount: number;
    guideCount: number;
  }>({
    lineCount: 0,
    spotCount: 0,
    guideCount: 0,
  });
  const {
    data: countryDetails,
    isFetching,
    refetch,
  } = countryApi.useGetCountryDetailsQuery(props.countryCode);

  useEffect(() => {
    const loadStats = async () => {
      const points = await getSlacklinePointFeaturesOfCountry(props.countryCode);
      setStatsInfo(points.stats);
    };
    loadStats();
  }, [props.countryCode, setStatsInfo]);

  const onCloseClicked = () => {
    navigate({ pathname: '/' });
  };

  const onRefreshClicked = () => {
    cardHeaderPopupState.close();
    refetch();
    dispatch(countryApi.util.invalidateTags(['countryDetails', 'countryChangelogs']));
  };

  const stats = useMemo(
    () => [
      {
        label: 'Lines',
        value: statsInfo.lineCount,
        icon: <SlacklineFeatureIcon fontSize="medium" />,
        color: appColors.lineStrokeColor,
      },
      {
        label: 'Spots',
        value: statsInfo.spotCount,
        icon: <PentagonIcon fontSize="medium" />,
        color: appColors.spotFillColor,
      },
      {
        label: 'Access Guides',
        value: statsInfo.guideCount,
        icon: <FollowTheSignsIcon fontSize="medium" />,
        color: appColors.guideFeaturesColor,
      },
    ],
    [statsInfo],
  );

  return (
    <Card
      sx={{
        boxShadow: 'none',
        border: 'none',
        height: '100%',
        width: '100%',
        overflow: 'scroll',
      }}
    >
      {isFetching || !countryDetails ? (
        <LoadingIndicator />
      ) : (
        <>
          <CardHeader
            avatar={
              <Avatar
                src={`https://hatscripts.github.io/circle-flags/flags/${props.countryCode.toLowerCase()}.svg`}
              >
                C
              </Avatar>
            }
            action={
              <>
                <IconButton onClick={onCloseClicked}>
                  <CloseIcon />
                </IconButton>

                <IconButton {...bindTrigger(cardHeaderPopupState)}>
                  <MoreVertIcon />
                </IconButton>

                <Menu
                  {...bindMenu(cardHeaderPopupState)}
                  sx={{
                    '& svg': {
                      mr: 1,
                      color: (t) => t.palette.primary.main,
                    },
                  }}
                >
                  <MenuItem onClick={onRefreshClicked}>
                    <RefreshIcon />
                    Refresh
                  </MenuItem>
                </Menu>
              </>
            }
            title={countryDetails.name ?? 'Unknown'}
            titleTypographyProps={{
              variant: 'h6',
            }}
          />
          <Divider />
          <CardContent component={Stack} spacing={2}>
            <FeatureDetailFieldLayout icon={<BarChartIcon />} header={'Statistics'}>
              <Stack spacing={2}>
                {stats.map((stat, index) => (
                  <Stack key={index} direction={'row'} spacing={1} alignItems="center">
                    <Avatar
                      sx={{
                        width: 'auto',
                        height: 'auto',
                        p: 0.5,
                        backgroundColor: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Stack direction={'row'} spacing={1} alignItems="center">
                      <Typography variant="body2">{stat.label}:</Typography>
                      <Typography variant="body2Bold">{stat.value}</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </FeatureDetailFieldLayout>
            <CountryHistoryField
              code={props.countryCode}
              onChangelogClick={props.onChangelogClick}
              onChangelogHover={props.onChangelogHover}
            />
          </CardContent>
        </>
      )}
    </Card>
  );
};
