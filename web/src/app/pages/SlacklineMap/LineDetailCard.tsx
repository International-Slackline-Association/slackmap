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
import { GetLineDetailsAPIResponse, lineApi } from 'app/api/line-api';
import { FeatureHistoryField } from 'app/components/FeatureDetailFields/FeatureHistoryField';
import { FeatureMenuActions } from 'app/components/FeatureDetailFields/FeatureMenuActions';
import { FeatureDetailInfoField } from 'app/components/FeatureDetailFields/InfoField';
import { FeatureMediaField } from 'app/components/FeatureDetailFields/MediaField';
import { OutdatedInfoField } from 'app/components/FeatureDetailFields/OutdatedInfoField';
import { FeatureDetailRestrictionField } from 'app/components/FeatureDetailFields/RestrictionField';
import { FeatureDetailSpecsField } from 'app/components/FeatureDetailFields/SpecsField';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { format } from 'date-fns';
import startCase from 'lodash.startcase';
import { appColors } from 'styles/theme/colors';
import { imageUrlFromS3Key } from 'utils';

interface Props {
  lineId: string;
  onDetailsLoaded: (details: GetLineDetailsAPIResponse) => void;
}

export const LineDetailCard = (props: Props) => {
  const dispatch = useDispatch();

  const { data: lineDetails, isFetching, refetch } = lineApi.useGetLineDetailsQuery(props.lineId);

  useEffect(() => {
    if (lineDetails) {
      props.onDetailsLoaded(lineDetails);
    }
  }, [lineDetails]);

  const onRefreshClicked = () => {
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
              <FeatureMenuActions
                isUserEditor={lineDetails.isUserEditor}
                feature={{ id: props.lineId, type: 'line' }}
                onRefreshClick={onRefreshClicked}
              />
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
