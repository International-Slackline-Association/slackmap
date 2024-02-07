import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, Menu, MenuItem } from '@mui/material';

import { featureApi } from 'app/api/feature-api';
import { useConfirmDialog } from 'app/components/Dialogs/useConfirmDialog';
import { selectIsUserSignedIn } from 'app/slices/app/selectors';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import { useTextBoxDialog } from '../Dialogs/useTextBoxDialog';

interface Props {
  editorPermissions:
    | {
        canDelete: boolean;
        canEdit: boolean;
      }
    | undefined;
  feature: {
    id: string;
    type: SlacklineMapFeatureType;
  };
  onRefreshClick: () => void;
}

export const FeatureMenuActions = (props: Props) => {
  const cardHeaderPopupState = usePopupState({
    variant: 'popover',
    popupId: 'cardHeaderMenu',
  });
  const navigate = useNavigate();
  const { ConfirmDialog, showConfirmDialog } = useConfirmDialog();
  const { TextBoxDialog, showTextBoxDialog } = useTextBoxDialog();
  const isSignedIn = useSelector(selectIsUserSignedIn);
  const [searchParams] = useSearchParams();

  const [requestEditorship] = featureApi.useRequestTemporaryEditorshipMutation();
  const [deleteFeature, { isSuccess: isDeleted }] = featureApi.useDeleteFeatureMutation();
  const [sendDeleteFeatureRequest] = featureApi.useDeleteFeatureRequestMutation();

  useEffect(() => {
    if (isDeleted) {
      navigate({ pathname: '/', search: searchParams.toString() });
    }
  }, [isDeleted]);

  const onEditClick = async () => {
    cardHeaderPopupState.close();
    navigate(`/${props.feature.type}/${props.feature.id}/edit`);
  };

  const onDeleteClick = async () => {
    cardHeaderPopupState.close();
    if (props.editorPermissions?.canDelete) {
      showConfirmDialog({
        title: `Delete this ${props.feature.type}?`,
        description:
          'Please confirm that you want to delete this feature. This action cannot be undone',
        onConfirm: () => deleteFeature({ id: props.feature.id, type: props.feature.type }),
      });
    } else {
      showTextBoxDialog({
        title: `Send a delete request`,
        description:
          'Only the owner of this feature can delete it. If you still think that it should be deleted, please provide a reason. We will process your request as soon as possible.',
        confirmText: 'Send',
        onConfirm: (reason) => {
          console.log(reason);
          sendDeleteFeatureRequest({
            id: props.feature.id,
            type: props.feature.type,
            payload: { reason },
          });
        },
      });
    }
  };

  const onRequestEditorshipClick = async () => {
    cardHeaderPopupState.close();
    showConfirmDialog({
      title: 'Get Temporary Editor Permissions?',
      description:
        'You can get temporary permissions to edit this feature. The permissions will be revoked after 24 hours. All the edits you will make will be recorded in the history.',
      onConfirm: () => requestEditorship({ id: props.feature.id, type: props.feature.type }),
    });
  };

  const onCloseClicked = () => {
    navigate({ pathname: '/', search: searchParams.toString() });
  };

  const onRefreshClicked = () => {
    cardHeaderPopupState.close();
    props.onRefreshClick();
  };

  return (
    <>
      <ConfirmDialog />
      <TextBoxDialog />
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
        {props.feature.type !== 'country' && [
          props.editorPermissions?.canEdit ? (
            <MenuItem key="edit" onClick={onEditClick}>
              <EditIcon />
              Edit
            </MenuItem>
          ) : (
            <MenuItem key="request" onClick={onRequestEditorshipClick} disabled={!isSignedIn}>
              <ManageHistoryIcon />
              {isSignedIn ? 'Request to Edit' : 'Request to Edit(Sign-in)'}
            </MenuItem>
          ),
          <MenuItem key="delete" onClick={onDeleteClick} disabled={!isSignedIn}>
            <DeleteIcon />
            {isSignedIn ? 'Delete' : 'Delete(Sign-in)'}
          </MenuItem>,
        ]}
      </Menu>
    </>
  );
};
