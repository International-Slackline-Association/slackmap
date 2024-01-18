import React from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import LoadingButton from '@mui/lab/LoadingButton';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Box, Link, Typography } from '@mui/material';

import { countryApi } from 'app/api/country-api';
import { format } from 'date-fns';
import ReactHtmlParser from 'html-react-parser';

import { LoadingIndicator } from '../LoadingIndicator';
import { FeatureDetailFieldLayout } from './DetailFieldLayout';

interface Props {
  code: string;
  onChangelogClick: (featureId: string, featureType: SlacklineMapFeatureType) => void;
  onChangelogHover: (featureId?: string, featureType?: SlacklineMapFeatureType) => void;
}

const getIcon = (actionType: MapFeatureChangelogAction) => {
  switch (actionType) {
    case 'created':
      return <AddCircleIcon fontSize="small" />;
    case 'updatedDetails':
      return <EditIcon fontSize="small" />;
    case 'grantedTemporaryEditor':
      return <AdminPanelSettingsIcon fontSize="small" />;
    case 'updatedOwners':
      return <ChangeCircleIcon fontSize="small" />;
    default:
      return null;
  }
};

export const EnabledHistoryTimelineItem = () => (
  <TimelineItem>
    <TimelineSeparator>
      <TimelineDot color="primary">
        <HistoryToggleOffIcon fontSize="small" />
      </TimelineDot>
    </TimelineSeparator>
    <TimelineContent sx={{ alignItems: 'center' }}>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.8rem',
          color: (t) => t.palette.text.secondary,
        }}
      >
        {format(new Date('2023-05-06'), 'dd MMM yyy, HH:mm')}
      </Typography>
      <Typography variant="body2">
        Enabled the <b>History Tracking</b>. Changes after this date will be visible here.
      </Typography>
    </TimelineContent>
  </TimelineItem>
);

export const CountryHistoryField = (props: Props) => {
  const [cursor, setCursor] = React.useState<string>();

  const { data: changelogs, isFetching } = countryApi.useGetCountryChangelogsQuery({
    code: props.code,
    cursor,
  });

  const onChangelogClick = (featureId: string, featureType: SlacklineMapFeatureType) => {
    props.onChangelogClick(featureId, featureType);
  };

  const onChangelogHover = (featureId?: string, featureType?: SlacklineMapFeatureType) => {
    props.onChangelogHover(featureId, featureType);
  };

  return (
    <FeatureDetailFieldLayout icon={<HistoryIcon />} header={'History'} noDivider>
      {!changelogs ? (
        isFetching ? (
          <LoadingIndicator />
        ) : null
      ) : (
        <Box>
          <Timeline
            sx={{
              p: 0,
              m: 0,
              '& .MuiTimelineItem-missingOppositeContent:before': {
                display: 'none',
              },
            }}
          >
            {changelogs.items.map((changelog, index) => (
              <TimelineItem key={changelog.date}>
                <TimelineSeparator>
                  {index !== 0 && <TimelineConnector />}
                  <TimelineDot color="primary">{getIcon(changelog.actionType)}</TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{}}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.8rem',
                      color: (t) => t.palette.text.secondary,
                    }}
                  >
                    {format(new Date(changelog.date), 'dd MMM yyy, HH:mm')}
                  </Typography>
                  <Link
                    component="button"
                    variant="body2"
                    color="text.primary"
                    onClick={() => onChangelogClick(changelog.featureId, changelog.featureType)}
                    onMouseOver={() => onChangelogHover(changelog.featureId, changelog.featureType)}
                    onMouseOut={() => onChangelogHover()}
                    sx={{
                      textAlign: 'left',
                    }}
                  >
                    {ReactHtmlParser(changelog.htmlText)}
                  </Link>
                </TimelineContent>
              </TimelineItem>
            ))}
            {changelogs.pagination.cursor ? (
              <LoadingButton
                loading={isFetching}
                onClick={() => setCursor(changelogs.pagination.cursor)}
                variant="text"
              >
                Load more
              </LoadingButton>
            ) : (
              <EnabledHistoryTimelineItem />
            )}
          </Timeline>
        </Box>
      )}
    </FeatureDetailFieldLayout>
  );
};
