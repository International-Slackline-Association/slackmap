import { useCallback, useEffect, useState } from 'react';
import { MapboxGeoJSONFeature } from 'react-map-gl';
import { useNavigate } from 'react-router-dom';

import { Box, Stack } from '@mui/system';

import { getSlacklineGroupGeoJson, getSlacklineGroupsGeoJsonOfCountry } from 'app/api/geojson-data';
import { CommunityMap } from 'app/components/Maps/CommunityMap';
import { parseMapFeature } from 'app/components/Maps/mapUtils';
import { FeatureCollection } from 'geojson';
import { useMediaQuery } from 'utils/hooks/useMediaQuery';
import { usePageViewAnalytics } from 'utils/hooks/usePageViewAnalytics';

import { CommunityCountryDetailCard } from './CommunityCountryDetailCard';
import { CreateCommunitySpeedDial } from './CreateCommunitySpeedDial';
import { SlacklineGroupDetailCard } from './SlacklineGroupDetailCard';
import { useActiveCommunityFeature } from './useCommunityFeature';

export function CommunitiesPage() {
  usePageViewAnalytics();
  const navigate = useNavigate();

  const { isDesktop } = useMediaQuery();

  const [activeFeatureGeoJson, setActiveFeatureGeoJson] = useState<FeatureCollection>();

  const { activeFeature } = useActiveCommunityFeature();

  const updateActiveFeatureGeoJson = useCallback(async () => {
    if (!activeFeature) {
      setActiveFeatureGeoJson(undefined);
      return;
    }
    const { id, type } = activeFeature;
    if (type === 'slacklineGroup') {
      const { geoJson } = await getSlacklineGroupGeoJson(id);
      setActiveFeatureGeoJson(geoJson);
    } else if (type === 'communityCountry') {
      const { geoJson } = await getSlacklineGroupsGeoJsonOfCountry(id);
      setActiveFeatureGeoJson(geoJson);
    }
  }, [activeFeature]);

  const navigateToFeature = useCallback(
    (id: string, type?: CommunityMapFeatureType) => {
      if (!type) return;

      if (type === 'slacklineGroup' || type === 'isaMemberGroup') {
        navigate(`/communities/group/${id}`);
      } else if (type === 'communityCountry') {
        navigate(`/communities/country/${id}`);
      }
    },
    [navigate],
  );

  useEffect(() => {
    updateActiveFeatureGeoJson();
  }, [activeFeature]);

  const onSelectedFeatureChange = useCallback(
    (feature?: MapboxGeoJSONFeature) => {
      if (!feature) {
        navigate('/communities');
        return;
      }

      const { id, type } = parseMapFeature<CommunityMapFeatureType>(feature);
      navigateToFeature(id, type);
    },
    [activeFeature],
  );

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      sx={{
        minHeight: '100%',
        position: 'relative',
        height: '100%',
      }}
    >
      <Box
        sx={{
          height: { xs: activeFeature ? '75vh' : '100%', lg: '100vh' },
          width: { xs: '100%', lg: '100%' },
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <CreateCommunitySpeedDial />
        <CommunityMap
          onSelectedFeatureChange={onSelectedFeatureChange}
          activeCommunityFeature={activeFeature}
          activeCommunityFeatureGeoJson={activeFeatureGeoJson}
        />
      </Box>
      {activeFeature && (
        <Box
          sx={{
            flex: 1,
            height: { xs: 'auto', lg: '100vh' },
            position: isDesktop ? 'absolute' : 'unset',
            top: isDesktop ? '0' : 'unset',
            right: isDesktop ? '0' : 'unset',
            width: isDesktop ? '33%' : '100%',
            zIndex: 4,
          }}
        >
          {activeFeature.type === 'communityCountry' && (
            <CommunityCountryDetailCard countryCode={activeFeature.id} />
          )}
          {activeFeature.type === 'slacklineGroup' && (
            <SlacklineGroupDetailCard groupId={activeFeature.id} />
          )}
        </Box>
      )}
    </Stack>
  );
}
