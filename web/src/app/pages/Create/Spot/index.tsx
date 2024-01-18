import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Box, Stack } from '@mui/system';

import { spotApi } from 'app/api/spot-api';
import { DrawableMap } from 'app/components/Maps/SlacklineMap/DrawableMap';
import { drawControlStyles } from 'app/components/Maps/SlacklineMap/DrawableMap/DrawControl/styles';
import { mapUrlSearchParams } from 'app/components/Maps/mapUtils';
import { Feature, FeatureCollection } from 'geojson';
import { usePageViewAnalytics } from 'utils/hooks/usePageViewAnalytics';

import { SpotEditCard } from './SpotEditCard';
import { SpotDetailsForm } from './types';
import { validateSpotFeatures } from './validations';

export function CreateSpotPage() {
  usePageViewAnalytics();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [mapErrors, setMapErrors] = useState<string[]>([]);

  const [createSpot, { isLoading: isSaving, isSuccess: isSavedChanges }] =
    spotApi.useCreateSpotMutation();

  useEffect(() => {
    if (isSavedChanges) {
      navigate({ pathname: '/', search: searchParams.toString() });
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

  const onDrawingFeaturesChanged = (features: Feature[]) => {
    setFeatures(features);
  };

  const onDetailsSubmit = (values: SpotDetailsForm) => {
    const geoJson: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };
    createSpot({ ...values, geoJson });
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
            polygon: true,
            line_string: false,
            trash: true,
          }}
          onDrawingFeaturesChanged={onDrawingFeaturesChanged}
          drawControlStyles={drawControlStyles('spot')}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          height: { xs: 'auto', lg: '100vh' },
        }}
      >
        <SpotEditCard
          mapErrors={mapErrors}
          onSubmit={onDetailsSubmit}
          disableSubmit={features.length === 0 || mapErrors.length > 0}
          isSubmitting={isSaving}
        />
      </Box>
    </Stack>
  );
}
