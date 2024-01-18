import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
import { guideApi } from 'app/api/guide-api';
import { GetGuideDetailsAPIResponse } from 'app/api/types';
import { FeatureDetailInfoField } from 'app/components/FeatureDetailFields/InfoField';
import { FeatureMediaField } from 'app/components/FeatureDetailFields/MediaField';
import { OutdatedInfoField } from 'app/components/FeatureDetailFields/OutdatedInfoField';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { format } from 'date-fns';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { appColors } from 'styles/theme/colors';
import { imageUrlFromS3Key } from 'utils';
import { useConfirmDialog } from 'utils/hooks/useConfirmDialog';

interface Props {
  guideId: string;
  onDetailsLoaded: (details: GetGuideDetailsAPIResponse) => void;
}

export const GuideDetailCard = (props: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cardHeaderPopupState = usePopupState({
    variant: 'popover',
    popupId: 'cardHeaderMenu',
  });
  const confirmDialog = useConfirmDialog();
  const dispatch = useDispatch();

  const {
    data: guideDetails,
    isFetching,
    refetch,
  } = guideApi.useGetGuideDetailsQuery(props.guideId);
  const [deleteGuide, { isSuccess: isDeleted }] = guideApi.useDeleteGuideMutation();

  useEffect(() => {
    if (isDeleted) {
      navigate({ pathname: '/', search: searchParams.toString() });
    }
  }, [isDeleted]);

  useEffect(() => {
    if (guideDetails) {
      props.onDetailsLoaded(guideDetails);
    }
  }, [guideDetails]);

  const onEditClick = async () => {
    cardHeaderPopupState.close();
    navigate(`/guide/${props.guideId}/edit`);
  };

  const onDeleteClick = async () => {
    cardHeaderPopupState.close();
    await confirmDialog({
      title: 'Delete guide?',
      content: 'Are you sure you want to delete this guide?',
    }).then(() => {
      deleteGuide(props.guideId);
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

  const guideCenter = guideDetails?.geoJson
    ? centerOfMass(guideDetails.geoJson).geometry.coordinates
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
      {isFetching || !guideDetails ? (
        <LoadingIndicator />
      ) : (
        <>
          <CardHeader
            avatar={
              <Avatar
                src=""
                sx={{
                  backgroundColor: appColors.guideFeaturesColor,
                }}
              >
                G
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
                  <MenuItem onClick={onEditClick} disabled={!guideDetails.isUserEditor}>
                    <EditIcon />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={onDeleteClick} disabled={!guideDetails.isUserEditor}>
                    <DeleteIcon />
                    Delete
                  </MenuItem>
                </Menu>
              </>
            }
            title={`${guideDetails.typeLabel}`}
            subheader={`Last updated: ${format(
              new Date(guideDetails.lastModifiedDateTime ?? guideDetails.createdDateTime),
              'dd MMM yyy',
            )}`}
          />
          <CardMedia
            component="img"
            height="194"
            image={
              imageUrlFromS3Key(
                guideDetails?.images?.find((i) => i.isCover)?.s3Key ||
                  guideDetails?.images?.[0]?.s3Key,
              ) || '/images/coverImageFallback.svg'
            }
          />
          <CardContent component={Stack} spacing={2} sx={{}}>
            <OutdatedInfoField
              updatedDate={new Date(
                guideDetails.lastModifiedDateTime ?? guideDetails.createdDateTime,
              )?.toISOString()}
            />

            <FeatureDetailInfoField
              header="Description"
              content={guideDetails.description}
              skipIfEmpty
              infoType="description"
            />

            <FeatureMediaField images={guideDetails.images} />
          </CardContent>
          <CardActions>
            {guideCenter && (
              <IconButton
                href={`https://maps.google.com/maps?z=12&t=m&q=loc:${guideCenter[1]}+${guideCenter[0]}`}
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
