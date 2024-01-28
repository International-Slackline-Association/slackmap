import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import MapIcon from '@mui/icons-material/Map';
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
import { GetSpotDetailsAPIResponse, spotApi } from 'app/api/spot-api';
import { FeatureHistoryField } from 'app/components/FeatureDetailFields/FeatureHistoryField';
import { FeatureMenuActions } from 'app/components/FeatureDetailFields/FeatureMenuActions';
import { FeatureDetailInfoField } from 'app/components/FeatureDetailFields/InfoField';
import { FeatureMediaField } from 'app/components/FeatureDetailFields/MediaField';
import { OutdatedInfoField } from 'app/components/FeatureDetailFields/OutdatedInfoField';
import { FeatureDetailRestrictionField } from 'app/components/FeatureDetailFields/RestrictionField';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { format } from 'date-fns';
import { appColors } from 'styles/theme/colors';
import { imageUrlFromS3Key } from 'utils';

interface Props {
  spotId: string;
  onDetailsLoaded: (details: GetSpotDetailsAPIResponse) => void;
}

export const SpotDetailCard = (props: Props) => {
  const dispatch = useDispatch();

  const { data: spotDetails, isFetching, refetch } = spotApi.useGetSpotDetailsQuery(props.spotId);

  useEffect(() => {
    if (spotDetails) {
      props.onDetailsLoaded(spotDetails);
    }
  }, [spotDetails]);

  const onRefreshClicked = () => {
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
              <FeatureMenuActions
                editorPermissions={spotDetails.editorPermissions}
                feature={{ id: props.spotId, type: 'spot' }}
                onRefreshClick={onRefreshClicked}
              />
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
