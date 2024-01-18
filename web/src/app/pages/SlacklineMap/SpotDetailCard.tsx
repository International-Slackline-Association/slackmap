import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import MapIcon from '@mui/icons-material/Map';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Menu, MenuItem } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';

import { centerOfMass } from '@turf/turf';
import { featureApi } from 'app/api/feature-api';
import { spotApi } from 'app/api/spot-api';
import { GetSpotDetailsAPIResponse } from 'app/api/types';
import { FeatureHistoryField } from 'app/components/FeatureDetailFields/FeatureHistoryField';
import { FeatureDetailInfoField } from 'app/components/FeatureDetailFields/InfoField';
import { FeatureMediaField } from 'app/components/FeatureDetailFields/MediaField';
import { OutdatedInfoField } from 'app/components/FeatureDetailFields/OutdatedInfoField';
import { FeatureDetailRestrictionField } from 'app/components/FeatureDetailFields/RestrictionField';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { selectIsUserSignedIn } from 'app/slices/app/selectors';
import { format } from 'date-fns';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { appColors } from 'styles/theme/colors';
import { imageUrlFromS3Key } from 'utils';
import { useConfirmDialog } from 'utils/hooks/useConfirmDialog';

interface Props {
  spotId: string;
  onDetailsLoaded: (details: GetSpotDetailsAPIResponse) => void;
}

export const SpotDetailCard = (props: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignedIn = useSelector(selectIsUserSignedIn);

  const cardHeaderPopupState = usePopupState({
    variant: 'popover',
    popupId: 'cardHeaderMenu',
  });
  const confirmDialog = useConfirmDialog();
  const dispatch = useDispatch();

  const { data: spotDetails, isFetching, refetch } = spotApi.useGetSpotDetailsQuery(props.spotId);
  const [deleteSpot, { isSuccess: isDeleted }] = spotApi.useDeleteSpotMutation();

  const [requestEditorship] = featureApi.useRequestTemporaryEditorshipMutation();

  useEffect(() => {
    if (isDeleted) {
      navigate({ pathname: '/', search: searchParams.toString() });
    }
  }, [isDeleted]);

  useEffect(() => {
    if (spotDetails) {
      props.onDetailsLoaded(spotDetails);
    }
  }, [spotDetails]);

  const onEditClick = async () => {
    cardHeaderPopupState.close();
    navigate(`/spot/${props.spotId}/edit`);
  };

  const onDeleteClick = async () => {
    cardHeaderPopupState.close();
    await confirmDialog({
      title: 'Delete spot?',
      content: 'Are you sure you want to delete this spot?',
    }).then(() => {
      deleteSpot(props.spotId);
    });
  };

  const onRequestEditorshipClick = async () => {
    cardHeaderPopupState.close();
    await confirmDialog({
      title: 'Get Temporary Permissions',
      content: `This spot seems to have no editors. You can get temporary permissions to edit this spot. 
        The permissions will be revoked after 24 hours (1 day).`,
    }).then(() => {
      requestEditorship({ id: props.spotId, type: 'spot' });
    });
  };

  const onCloseClicked = () => {
    navigate({ pathname: '/', search: searchParams.toString() });
  };

  const onRefreshClicked = () => {
    cardHeaderPopupState.close();
    refetch();
    dispatch(featureApi.util.invalidateTags(['featureChangelogs']));
  };

  const spotCenter = spotDetails?.geoJson
    ? centerOfMass(spotDetails.geoJson).geometry.coordinates
    : undefined;

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
      {isFetching || !spotDetails ? (
        <LoadingIndicator />
      ) : (
        <>
          <CardHeader
            avatar={
              <Avatar
                src=""
                sx={{
                  backgroundColor: appColors.spotFillColor,
                }}
              >
                S
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
                  <MenuItem onClick={onEditClick} disabled={!spotDetails.isUserEditor}>
                    <EditIcon />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={onDeleteClick} disabled={!spotDetails.isUserEditor}>
                    <DeleteIcon />
                    Delete
                  </MenuItem>
                  {!spotDetails.isUserEditor && (
                    <MenuItem onClick={onRequestEditorshipClick} disabled={!isSignedIn}>
                      <ManageHistoryIcon />
                      Request to Edit
                    </MenuItem>
                  )}
                </Menu>
              </>
            }
            title={spotDetails.name || 'Unknown Name'}
            subheader={`Last updated: ${format(
              new Date(spotDetails.lastModifiedDateTime ?? spotDetails.createdDateTime),
              'dd MMM yyy',
            )}`}
          />
          <CardMedia
            component="img"
            height="194"
            image={
              imageUrlFromS3Key(
                spotDetails?.images?.find((i) => i.isCover)?.s3Key ||
                  spotDetails?.images?.[0]?.s3Key,
              ) || '/images/coverImageFallback.svg'
            }
          />
          <CardContent component={Stack} spacing={2} sx={{}}>
            <FeatureDetailRestrictionField
              level={spotDetails.restrictionLevel}
              restrictionInfo={spotDetails.restrictionInfo}
            />

            <OutdatedInfoField
              updatedDate={new Date(
                spotDetails.lastModifiedDateTime ?? spotDetails.createdDateTime,
              )?.toISOString()}
            />

            <FeatureDetailInfoField
              header="Description"
              content={spotDetails.description}
              skipIfEmpty
              infoType="description"
            />

            <FeatureDetailInfoField
              header="Access"
              content={spotDetails.accessInfo}
              skipIfEmpty
              infoType="access"
            />

            <FeatureDetailInfoField
              header="Contact"
              content={spotDetails.contactInfo}
              skipIfEmpty
              infoType="contact"
            />
            <FeatureDetailInfoField
              header="Additional Details"
              content={spotDetails.extraInfo}
              skipIfEmpty
              infoType="additional"
            />
            <FeatureMediaField images={spotDetails.images} />
            <FeatureHistoryField
              featureId={props.spotId}
              featureType="spot"
              createdDateTime={spotDetails.createdDateTime}
            />
          </CardContent>
          <CardActions>
            {spotCenter && (
              <IconButton
                href={`https://maps.google.com/maps?z=12&t=m&q=loc:${spotCenter[1]}+${spotCenter[0]}`}
                target="_blank"
              >
                <MapIcon color="primary" />
              </IconButton>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
};
