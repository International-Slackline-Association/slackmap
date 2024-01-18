import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Stack } from '@mui/system';

import { guideApi } from 'app/api/guide-api';
import { DrawableMap } from 'app/components/Maps/SlacklineMap/DrawableMap';
import { drawControlStyles } from 'app/components/Maps/SlacklineMap/DrawableMap/DrawControl/styles';
import { GuideEditCard } from 'app/pages/Create/Guide/GuideEditCard';
import { GuideDetailsForm } from 'app/pages/Create/Guide/types';
import { validateGuideFeatures } from 'app/pages/Create/Guide/validations';
import { Feature, FeatureCollection } from 'geojson';

export function GuideEditPage() {
  const { guideId } = useParams();
  const navigate = useNavigate();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [mapErrors, setMapErrors] = useState<string[]>([]);

  const { data: guideDetails } = guideApi.useGetGuideDetailsQuery(guideId!);

  const [updateGuide, { isLoading: isSaving, isSuccess: isSavedChanges }] =
    guideApi.useUpdateGuideMutation();

  useEffect(() => {
    if (isSavedChanges) {
      navigate({ pathname: `/guide/${guideId}` });
    }
  }, [isSavedChanges]);

  useEffect(() => {
    const errors = validateGuideFeatures(features);
    if (errors.length > 0) {
      setMapErrors(errors);
      return;
    } else {
      setMapErrors([]);
    }
  }, [features]);

  useEffect(() => {
    if (guideDetails?.geoJson) {
      setFeatures(guideDetails.geoJson.features as Feature[]);
    }
  }, [guideDetails]);

  const onDrawingFeaturesChanged = (features: Feature[]) => {
    setFeatures(features);
  };

  const onDetailsSubmit = (values: GuideDetailsForm) => {
    const geoJson: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };
    updateGuide({ id: guideId!, payload: { ...values, geoJson } });
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
        {guideDetails?.geoJson && (
          <DrawableMap
            drawControls={{
              point: true,
              polygon: true,
              line_string: true,
              trash: true,
            }}
            onDrawingFeaturesChanged={onDrawingFeaturesChanged}
            drawControlStyles={drawControlStyles('guide')}
            drawingFeatures={guideDetails.geoJson.features as Feature[]}
          />
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          height: { xs: 'auto', lg: '100vh' },
        }}
      >
        {guideDetails && (
          <GuideEditCard
            mapErrors={mapErrors}
            onSubmit={onDetailsSubmit}
            disableSubmit={features.length === 0 || mapErrors.length > 0}
            isSubmitting={isSaving}
            initialValues={{
              description: guideDetails.description,
              type: guideDetails.type,
              images: guideDetails.images,
            }}
          />
        )}
      </Box>
    </Stack>
  );
}
