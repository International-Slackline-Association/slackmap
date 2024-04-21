import React from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import LoadingButton from '@mui/lab/LoadingButton';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Box, Typography } from '@mui/material';

import { MapFeatureChangelogAction } from '@server/core/types';
import { featureApi } from 'app/api/feature-api';
import { format } from 'date-fns';
import ReactHtmlParser from 'html-react-parser';

import { LoadingIndicator } from '../LoadingIndicator';
import { EnabledHistoryTimelineItem } from './CountryHistoryField';
import { FeatureDetailFieldLayout } from './DetailFieldLayout';

interface Props {
  featureId: string;
  featureType: SlacklineMapFeatureType;
  createdDateTime: string;
}

export const ChangelogActionIcon = (props: { type: MapFeatureChangelogAction }) => {
  switch (props.type) {
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

export const FeatureHistoryField = (props: Props) => {
  const [cursor, setCursor] = React.useState<string>();

  const { data: changelogs, isFetching } = featureApi.useGetChangelogsQuery({
    id: props.featureId,
    type: props.featureType,
    cursor,
  });

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
                  <TimelineDot color="primary">
                    <ChangelogActionIcon type={changelog.actionType} />
                  </TimelineDot>
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
                  <Typography variant="body2">{ReactHtmlParser(changelog.htmlText)}</Typography>
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
              new Date(props.createdDateTime) < new Date('2023-05-06') && (
                <EnabledHistoryTimelineItem />
              )
            )}
          </Timeline>
        </Box>
      )}
    </FeatureDetailFieldLayout>
  );
};
