import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { SpeedDial, SpeedDialAction } from '@mui/material';

import { useConfirm } from 'material-ui-confirm';

import { GroupsManifestText } from './GroupsManifestText';

export function CreateCommunitySpeedDial() {
  const confirm = useConfirm();

  const onAddGroupClick = async () => {
    await confirm({
      title: 'Adding a new slackline group?',
      content: <GroupsManifestText type="createGroup" />,
      cancellationButtonProps: {
        sx: { display: 'none' },
      },
      dialogProps: {
        PaperProps: {
          sx: {
            color: 'inherit',
            border: '1px solid',
            borderColor: (t) => t.palette.primary.main,
          },
        },
      },
    });
  };
  return (
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
  );
}
