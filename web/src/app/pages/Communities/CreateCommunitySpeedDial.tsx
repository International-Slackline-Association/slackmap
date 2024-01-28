import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { SpeedDial, SpeedDialAction } from '@mui/material';

import { useInfoDialog } from 'app/components/Dialogs/useInfoDialog';

import { GroupsManifestText } from './GroupsManifestText';

export function CreateCommunitySpeedDial() {
  const { InfoDialog, showInfoDialog } = useInfoDialog();

  const onAddGroupClick = async () => {
    showInfoDialog({
      title: 'Adding a new slackline group?',
      description: <GroupsManifestText type="createGroup" />,
    });
  };

  return (
    <>
      <InfoDialog />
      <SpeedDial
        sx={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3,
        }}
        icon={<AddIcon />}
        ariaLabel={'speed dial'}
      >
        <SpeedDialAction
          icon={<GroupIcon />}
          tooltipTitle={'Add a new slackline group'}
          onClick={onAddGroupClick}
          sx={{
            color: (t) => t.palette.primary.main,
          }}
        />
      </SpeedDial>
    </>
  );
}
