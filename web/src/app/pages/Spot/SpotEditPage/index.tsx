import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Stack } from '@mui/system';

import { spotApi } from 'app/api/spot-api';
import { DrawableMap } from 'app/components/Maps/SlacklineMap/DrawableMap';
import { drawControlStyles } from 'app/components/Maps/SlacklineMap/DrawableMap/DrawControl/styles';
import { SpotEditCard } from 'app/pages/Create/Spot/SpotEditCard';
import { SpotDetailsForm } from 'app/pages/Create/Spot/types';
import { validateSpotFeatures } from 'app/pages/Create/Spot/validations';
import { Feature, FeatureCollection } from 'geojson';

export function SpotEditPage() {
  const { spotId } = useParams();
  const navigate = useNavigate();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [mapErrors, setMapErrors] = useState<string[]>([]);

  const { data: spotDetails } = spotApi.useGetSpotDetailsQuery(spotId!);

  const [updateSpot, { isLoading: isSaving, isSuccess: isSavedChanges }] =
    spotApi.useUpdateSpotMutation();

  useEffect(() => {
    if (isSavedChanges) {
      navigate({ pathname: `/spot/${spotId}` });
    }
  }, [isSavedChanges]);

  useEffect(() => {
    const errors = validateSpotFeatures(features);
    if (errors.length > 0) {
      setMapErrors(errors);
      return;
    } else {
      setMapErrors([]);
    }
  }, [features]);

  useEffect(() => {
    if (spotDetails) {
      setFeatures(spotDetails.geoJson.features as Feature[]);
    }
  }, [spotDetails]);

  const onDrawingFeaturesChanged = (features: Feature[]) => {
    setFeatures(features);
  };

  const onDetailsSubmit = (values: SpotDetailsForm) => {
    const geoJson: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };
    updateSpot({ id: spotId!, payload: { ...values, geoJson } });
  };

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      sx={{
        minHeight: '100%',
      }}
    >
      <Box
        sx={{
          height: { xs: '50vh', lg: '100vh' },
          width: { xs: '100%', lg: '67%' },
          position: 'relative',
        }}
      >
        {spotDetails?.geoJson && (
          <DrawableMap
            drawControls={{
              polygon: true,
              line_string: false,
              trash: true,
            }}
            onDrawingFeaturesChanged={onDrawingFeaturesChanged}
            drawControlStyles={drawControlStyles('spot')}
            drawingFeatures={spotDetails.geoJson.features as Feature[]}
          />
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          height: { xs: 'auto', lg: '100vh' },
        }}
      >
        {spotDetails && (
          <SpotEditCard
            mapErrors={mapErrors}
            onSubmit={onDetailsSubmit}
            disableSubmit={features.length === 0 || mapErrors.length > 0}
            isSubmitting={isSaving}
            initialValues={{
              accessInfo: spotDetails.accessInfo,
              description: spotDetails.description,
              name: spotDetails.name,
              contactInfo: spotDetails.contactInfo,
              extraInfo: spotDetails.extraInfo,
              restrictionInfo: spotDetails.restrictionInfo,
              restrictionLevel: spotDetails.restrictionLevel,
              images: spotDetails.images,
            }}
          />
        )}
      </Box>
    </Stack>
  );
}
