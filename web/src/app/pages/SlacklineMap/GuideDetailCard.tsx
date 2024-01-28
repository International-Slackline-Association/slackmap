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
import { GetGuideDetailsAPIResponse, guideApi } from 'app/api/guide-api';
import { FeatureMenuActions } from 'app/components/FeatureDetailFields/FeatureMenuActions';
import { FeatureDetailInfoField } from 'app/components/FeatureDetailFields/InfoField';
import { FeatureMediaField } from 'app/components/FeatureDetailFields/MediaField';
import { OutdatedInfoField } from 'app/components/FeatureDetailFields/OutdatedInfoField';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { format } from 'date-fns';
import { appColors } from 'styles/theme/colors';
import { imageUrlFromS3Key } from 'utils';

interface Props {
  guideId: string;
  onDetailsLoaded: (details: GetGuideDetailsAPIResponse) => void;
}

export const GuideDetailCard = (props: Props) => {
  const dispatch = useDispatch();

  const {
    data: guideDetails,
    isFetching,
    refetch,
  } = guideApi.useGetGuideDetailsQuery(props.guideId);

  useEffect(() => {
    if (guideDetails) {
      props.onDetailsLoaded(guideDetails);
    }
  }, [guideDetails]);

  const onRefreshClicked = () => {
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
              <FeatureMenuActions
                isUserEditor={guideDetails.isUserEditor}
                feature={{ id: props.guideId, type: 'guide' }}
                onRefreshClick={onRefreshClicked}
              />
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
