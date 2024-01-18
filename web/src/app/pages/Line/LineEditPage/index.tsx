import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Stack } from '@mui/system';

import { lineApi } from 'app/api/line-api';
import { DrawableMap } from 'app/components/Maps/SlacklineMap/DrawableMap';
import { drawControlStyles } from 'app/components/Maps/SlacklineMap/DrawableMap/DrawControl/styles';
import { LineEditCard } from 'app/pages/Create/Line/LineEditCard';
import { LineDetailsForm } from 'app/pages/Create/Line/types';
import { validateLineFeatures } from 'app/pages/Create/Line/validations';
import { Feature, FeatureCollection } from 'geojson';

export function LineEditPage() {
  const { lineId } = useParams();
  const navigate = useNavigate();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [mapErrors, setMapErrors] = useState<string[]>([]);

  const { data: lineDetails } = lineApi.useGetLineDetailsQuery(lineId!);

  const [updateLine, { isLoading: isSaving, isSuccess: isSavedChanges }] =
    lineApi.useUpdateLineMutation();

  useEffect(() => {
    if (isSavedChanges) {
      navigate({ pathname: `/line/${lineId}` });
    }
  }, [isSavedChanges]);

  useEffect(() => {
    const errors = validateLineFeatures(features);
    if (errors.length > 0) {
      setMapErrors(errors);
      return;
    } else {
      setMapErrors([]);
    }
  }, [features]);

  useEffect(() => {
    if (lineDetails?.geoJson) {
      setFeatures(lineDetails.geoJson.features as Feature[]);
    }
  }, [lineDetails]);

  const onDrawingFeaturesChanged = (features: Feature[]) => {
    setFeatures(features);
  };

  const onDetailsSubmit = (values: LineDetailsForm) => {
    const geoJson: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };
    updateLine({ id: lineId!, payload: { ...values, geoJson } });
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
        {lineDetails?.geoJson && (
          <DrawableMap
            drawControls={{
              polygon: false,
              line_string: true,
              trash: true,
            }}
            onDrawingFeaturesChanged={onDrawingFeaturesChanged}
            drawControlStyles={drawControlStyles('line')}
            drawingFeatures={lineDetails?.geoJson.features as Feature[]}
          />
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          height: { xs: 'auto', lg: '100vh' },
        }}
      >
        {lineDetails && (
          <LineEditCard
            mapErrors={mapErrors}
            onSubmit={onDetailsSubmit}
            disableSubmit={features.length === 0 || mapErrors.length > 0}
            isSubmitting={isSaving}
            initialValues={{
              isMeasured: lineDetails.isMeasured || false,
              accessInfo: lineDetails.accessInfo,
              description: lineDetails.description,
              name: lineDetails.name,
              anchorsInfo: lineDetails.anchorsInfo,
              contactInfo: lineDetails.contactInfo,
              extraInfo: lineDetails.extraInfo,
              gearInfo: lineDetails.gearInfo,
              length: lineDetails.length,
              height: lineDetails.height,
              restrictionInfo: lineDetails.restrictionInfo,
              restrictionLevel: lineDetails.restrictionLevel,
              type: lineDetails.type,
              anchorImages: lineDetails.anchorImages,
              images: lineDetails.images,
            }}
          />
        )}
      </Box>
    </Stack>
  );
}
