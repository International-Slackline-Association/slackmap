import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Box, Stack } from '@mui/system';

import { guideApi } from 'app/api/guide-api';
import { DrawableMap } from 'app/components/Maps/SlacklineMap/DrawableMap';
import { drawControlStyles } from 'app/components/Maps/SlacklineMap/DrawableMap/DrawControl/styles';
import { mapUrlSearchParams } from 'app/components/Maps/mapUtils';
import { Feature, FeatureCollection } from 'geojson';
import { usePageViewAnalytics } from 'utils/hooks/usePageViewAnalytics';

import { GuideEditCard } from './GuideEditCard';
import { GuideDetailsForm } from './types';
import { validateGuideFeatures } from './validations';

export function CreateGuidePage() {
  usePageViewAnalytics();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [mapErrors, setMapErrors] = useState<string[]>([]);

  const [createGuide, { isLoading: isSaving, isSuccess: isSavedChanges }] =
    guideApi.useCreateGuideMutation();

  useEffect(() => {
    if (isSavedChanges) {
      navigate({ pathname: '/', search: searchParams.toString() });
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

  const onDrawingFeaturesChanged = (features: Feature[]) => {
    setFeatures(features);
  };

  const onDetailsSubmit = (values: GuideDetailsForm) => {
    const geoJson: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };
    createGuide({ ...values, geoJson });
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
        <DrawableMap
          initialViewState={mapUrlSearchParams.parse(searchParams)}
          drawControls={{
            point: true,
            polygon: true,
            line_string: true,
            trash: true,
          }}
          onDrawingFeaturesChanged={onDrawingFeaturesChanged}
          drawControlStyles={drawControlStyles('guide')}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          height: { xs: 'auto', lg: '100vh' },
        }}
      >
        <GuideEditCard
          mapErrors={mapErrors}
          onSubmit={onDetailsSubmit}
          disableSubmit={features.length === 0 || mapErrors.length > 0}
          isSubmitting={isSaving}
        />
      </Box>
    </Stack>
  );
}
