import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Badge, ToggleButton } from '@mui/material';

import { activityApi } from 'app/api/activity-api';
import { useAppLocalStorage } from 'utils/hooks/useAppLocalStorage';

interface Props {
  isSelected: boolean;
}

export const MapActivityButton = (props: Props) => {
  const [badgeCount, setBadgeCount] = useState(0);
  const navigate = useNavigate();

  const { data: changelogs } = activityApi.useGetActivityChangelogsQuery({});
  const latestChangelogDate = useAppLocalStorage('activity.lastSeenChangelogDate', '');

  useEffect(() => {
    if (props.isSelected || !changelogs || (changelogs?.items || []).length === 0) {
      setBadgeCount(0);
      return;
    }
    const index = changelogs.items.findIndex(
      (changelog) => changelog.date === latestChangelogDate.value,
    );
    if (index === -1) {
      setBadgeCount(21);
    } else {
      setBadgeCount(index);
    }
  }, [changelogs]);

  useEffect(() => {
    const date = changelogs?.items[0]?.date;
    if (props.isSelected && date) {
      latestChangelogDate.set(date);
      setBadgeCount(0);
    }
  }, [props.isSelected]);

  return (
    <ToggleButton
      value="activity"
      selected={props.isSelected}
      onChange={() => {
        navigate({ pathname: '/activity' });
      }}
      sx={{
        border: 'none',
        position: 'absolute',
        zIndex: 3,
        bottom: '2rem',
        left: { xs: '5rem', lg: '6rem' },
      }}
    >
      <Badge badgeContent={badgeCount} max={20} color="secondary">
        <TravelExploreIcon fontSize={'medium'} color="primary" />
      </Badge>
    </ToggleButton>
  );
};
