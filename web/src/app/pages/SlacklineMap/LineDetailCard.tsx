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
import { lineApi } from 'app/api/line-api';
import { GetLineDetailsAPIResponse } from 'app/api/types';
import { FeatureHistoryField } from 'app/components/FeatureDetailFields/FeatureHistoryField';
import { FeatureDetailInfoField } from 'app/components/FeatureDetailFields/InfoField';
import { FeatureMediaField } from 'app/components/FeatureDetailFields/MediaField';
import { OutdatedInfoField } from 'app/components/FeatureDetailFields/OutdatedInfoField';
import { FeatureDetailRestrictionField } from 'app/components/FeatureDetailFields/RestrictionField';
import { FeatureDetailSpecsField } from 'app/components/FeatureDetailFields/SpecsField';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { selectIsUserSignedIn } from 'app/slices/app/selectors';
import { format } from 'date-fns';
import startCase from 'lodash.startcase';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { appColors } from 'styles/theme/colors';
import { imageUrlFromS3Key } from 'utils';
import { useConfirmDialog } from 'utils/hooks/useConfirmDialog';

interface Props {
  lineId: string;
  onDetailsLoaded: (details: GetLineDetailsAPIResponse) => void;
}

export const LineDetailCard = (props: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignedIn = useSelector(selectIsUserSignedIn);

  const cardHeaderPopupState = usePopupState({
    variant: 'popover',
    popupId: 'cardHeaderMenu',
  });
  const confirmDialog = useConfirmDialog();
  const dispatch = useDispatch();

  const { data: lineDetails, isFetching, refetch } = lineApi.useGetLineDetailsQuery(props.lineId);

  const [deleteLine, { isSuccess: isDeleted }] = lineApi.useDeleteLineMutation();

  const [requestEditorship] = featureApi.useRequestTemporaryEditorshipMutation();

  useEffect(() => {
    if (isDeleted) {
      navigate({ pathname: '/', search: searchParams.toString() });
    }
  }, [isDeleted]);

  useEffect(() => {
    if (lineDetails) {
      props.onDetailsLoaded(lineDetails);
    }
  }, [lineDetails]);

  const onEditClick = async () => {
    cardHeaderPopupState.close();
    navigate(`/line/${props.lineId}/edit`);
  };

  const onDeleteClick = async () => {
    cardHeaderPopupState.close();
    await confirmDialog({
      title: 'Delete line?',
      content: 'Are you sure you want to delete this line?',
    }).then(() => {
      deleteLine(props.lineId);
    });
  };

  const onRequestEditorshipClick = async () => {
    cardHeaderPopupState.close();
    await confirmDialog({
      title: 'Get Temporary Permissions',
      content: `This line seems to have no editors. You can get temporary permissions to edit this line. 
        The permissions will be revoked after 24 hours (1 day).`,
    }).then(() => {
      requestEditorship({ id: props.lineId, type: 'line' });
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

  const lineCenter = lineDetails?.geoJson
    ? centerOfMass(lineDetails.geoJson).geometry.coordinates
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
      {isFetching || !lineDetails ? (
        <LoadingIndicator />
      ) : (
        <>
          <CardHeader
            avatar={
              <Avatar
                src=""
                sx={{
                  backgroundColor: appColors.lineStrokeColor,
                }}
              >
                L
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
                  <MenuItem onClick={onEditClick} disabled={!lineDetails.isUserEditor}>
                    <EditIcon />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={onDeleteClick} disabled={!lineDetails.isUserEditor}>
                    <DeleteIcon />
                    Delete
                  </MenuItem>
                  {!lineDetails.isUserEditor && (
                    <MenuItem onClick={onRequestEditorshipClick} disabled={!isSignedIn}>
                      <ManageHistoryIcon />
                      Request to Edit
                    </MenuItem>
                  )}
                </Menu>
              </>
            }
            title={lineDetails.name || 'No Name'}
            subheader={`Last updated: ${format(
              new Date(lineDetails.lastModifiedDateTime ?? lineDetails.createdDateTime),
              'dd MMM yyy',
            )}`}
          />
          <CardMedia
            component="img"
            height="194"
            image={
              imageUrlFromS3Key(
                lineDetails?.images?.find((i) => i.isCover)?.s3Key ||
                  lineDetails?.images?.[0]?.s3Key,
              ) || '/images/coverImageFallback.svg'
            }
          />
          <CardContent component={Stack} spacing={2} sx={{}}>
            <FeatureDetailRestrictionField
              level={lineDetails.restrictionLevel}
              restrictionInfo={lineDetails.restrictionInfo}
            />
            <OutdatedInfoField
              updatedDate={new Date(
                lineDetails.lastModifiedDateTime ?? lineDetails.createdDateTime,
              )?.toISOString()}
            />
            <FeatureDetailSpecsField
              isAccurate={lineDetails.isMeasured}
              content={[
                {
                  label: 'Slackline Type',
                  value: startCase(lineDetails.type) || '?',
                },
                {
                  label: 'Length',
                  value: `${lineDetails.length || '?'}m`,
                },
                {
                  label: 'Height',
                  value: `${lineDetails.height || '?'}m`,
                },
              ]}
            />
            <FeatureDetailInfoField
              header="Description"
              content={lineDetails.description}
              skipIfEmpty
              infoType="description"
            />
            <FeatureDetailInfoField
              header="Anchors"
              content={lineDetails.anchorsInfo}
              skipIfEmpty
              infoType="anchors"
            />
            <FeatureDetailInfoField
              header="Access"
              content={lineDetails.accessInfo}
              skipIfEmpty
              infoType="access"
            />
            <FeatureDetailInfoField
              header="Gear"
              content={lineDetails.gearInfo}
              skipIfEmpty
              infoType="gear"
            />
            <FeatureDetailInfoField
              header="Contact"
              content={lineDetails.contactInfo}
              skipIfEmpty
              infoType="contact"
            />
            <FeatureDetailInfoField
              header="Additional Details"
              content={lineDetails.extraInfo}
              skipIfEmpty
              infoType="additional"
            />
            <FeatureMediaField images={lineDetails.anchorImages} type={'anchor-images'} />
            <FeatureMediaField images={lineDetails.images} />

            <FeatureHistoryField
              featureId={props.lineId}
              featureType="line"
              createdDateTime={lineDetails.createdDateTime}
            />
          </CardContent>
          <CardActions>
            {lineCenter && (
              <IconButton
                href={`https://maps.google.com/maps?z=12&t=m&q=loc:${lineCenter[1]}+${lineCenter[0]}`}
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
