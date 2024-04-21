import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Avatar, Button, Divider, Menu, MenuItem, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';

import { activityApi } from 'app/api/activity-api';
import { ActivityHistoryField } from 'app/components/FeatureDetailFields/ActivityHistoryField';
import { FeatureDetailFieldLayout } from 'app/components/FeatureDetailFields/DetailFieldLayout';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { trimString } from 'utils';

interface Props {
  onChangelogClick: (featureId: string, featureType: SlacklineMapFeatureType) => void;
  onChangelogHover: (featureId?: string, featureType?: SlacklineMapFeatureType) => void;
}

export const ActivityDetailCard = (props: Props) => {
  const [contributorsDisplayLength, setContributorsDisplayLength] = useState(5);

  const navigate = useNavigate();
  const cardHeaderPopupState = usePopupState({
    variant: 'popover',
    popupId: 'cardHeaderMenu',
  });
  const dispatch = useDispatch();

  const { data: contributors, isFetching, refetch } = activityApi.useGetGlobalContributorsQuery();

  const onCloseClicked = () => {
    navigate({ pathname: '/' });
  };

  const onRefreshClicked = () => {
    cardHeaderPopupState.close();
    refetch();
    dispatch(activityApi.util.invalidateTags(['activityContributors', 'activityChangelogs']));
  };

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
      {isFetching || !contributors ? (
        <LoadingIndicator />
      ) : (
        <>
          <CardHeader
            avatar={
              <Avatar
                src=""
                sx={{
                  backgroundColor: (t) => t.palette.primary.main,
                }}
              >
                <TravelExploreIcon
                  sx={{
                    fontSize: '2rem',
                    color: (t) => t.palette.primary.contrastText,
                  }}
                />
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
            title={'Global Activity'}
            titleTypographyProps={{
              variant: 'h6',
            }}
          />
          <Divider />
          <CardContent component={Stack} spacing={2}>
            <FeatureDetailFieldLayout
              icon={<EmojiEventsIcon />}
              header={'Top Contributors'}
              subHeader={
                'List of the most active contributors based on the number of created and updated lines/spots/guides. The list is updated weekly.'
              }
            >
              <Stack spacing={2}>
                {contributors?.items?.slice(0, contributorsDisplayLength).map((c) => (
                  <CardHeader
                    key={c.user.fullName}
                    sx={{
                      p: 0,
                    }}
                    avatar={
                      <Avatar
                        src={c.user.profilePictureUrl}
                        sx={{
                          backgroundColor: (t) => t.palette.primary.main,
                        }}
                      >
                        {c.user.fullName.charAt(0)}
                      </Avatar>
                    }
                    title={c.user.fullName}
                    subheader={
                      <Stack direction="row" spacing={0.5} alignItems={'center'}>
                        {c.user.countryCode && (
                          <>
                            <Avatar
                              src={`https://hatscripts.github.io/circle-flags/flags/${c.user.countryCode?.toLowerCase()}.svg`}
                              sx={{
                                width: 15,
                                height: 15,
                                bgcolor: 'transparent',
                              }}
                            />
                            <Typography variant="body2">
                              {trimString(c.user.countryName, 12)}
                            </Typography>
                            <Divider orientation="vertical" flexItem />
                          </>
                        )}
                        <Typography variant="body2">
                          <b>{c.added}</b> created, <b>{c.updated}</b> updated
                        </Typography>
                      </Stack>
                    }
                  />
                ))}
                {contributorsDisplayLength < contributors.items.length && (
                  <Button
                    variant="text"
                    onClick={() => setContributorsDisplayLength(contributorsDisplayLength + 10)}
                  >
                    Show more
                  </Button>
                )}
              </Stack>
            </FeatureDetailFieldLayout>
            <ActivityHistoryField
              onChangelogClick={props.onChangelogClick}
              onChangelogHover={props.onChangelogHover}
            />
          </CardContent>
        </>
      )}
    </Card>
  );
};
