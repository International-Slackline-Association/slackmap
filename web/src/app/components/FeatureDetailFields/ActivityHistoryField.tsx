import React from 'react';

import HistoryIcon from '@mui/icons-material/History';
import LoadingButton from '@mui/lab/LoadingButton';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Box, Link, Typography } from '@mui/material';

import { activityApi } from 'app/api/activity-api';
import { format } from 'date-fns';
import ReactHtmlParser from 'html-react-parser';

import { LoadingIndicator } from '../LoadingIndicator';
import { FeatureDetailFieldLayout } from './DetailFieldLayout';
import { ChangelogActionIcon } from './FeatureHistoryField';

interface Props {
  onChangelogClick: (featureId: string, featureType: SlacklineMapFeatureType) => void;
  onChangelogHover: (featureId?: string, featureType?: SlacklineMapFeatureType) => void;
}

export const ActivityHistoryField = (props: Props) => {
  const [cursor, setCursor] = React.useState<string>();

  const { data: changelogs, isFetching } = activityApi.useGetActivityChangelogsQuery({
    cursor,
  });

  const onChangelogClick = (featureId: string, featureType: SlacklineMapFeatureType) => {
    props.onChangelogClick(featureId, featureType);
  };

  const onChangelogHover = (featureId?: string, featureType?: SlacklineMapFeatureType) => {
    props.onChangelogHover(featureId, featureType);
  };

  return (
    <FeatureDetailFieldLayout icon={<HistoryIcon />} header={'Global History'} noDivider>
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
            {changelogs.pagination.cursor && (
              <LoadingButton
                loading={isFetching}
                onClick={() => setCursor(changelogs.pagination.cursor)}
                variant="text"
              >
                Load more
              </LoadingButton>
            )}
          </Timeline>
        </Box>
      )}
    </FeatureDetailFieldLayout>
  );
};
