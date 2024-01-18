import { useCallback, useEffect, useState } from 'react';
import { MapboxGeoJSONFeature, ViewStateChangeEvent } from 'react-map-gl';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Stack } from '@mui/material';
import { Box } from '@mui/system';

import { getSlacklinePointFeaturesOfCountry } from 'app/api/geojson-data';
import {
  GetGuideDetailsAPIResponse,
  GetLineDetailsAPIResponse,
  GetSpotDetailsAPIResponse,
} from 'app/api/types';
import { SlacklineMap } from 'app/components/Maps/SlacklineMap';
import { mapUrlSearchParams, parseMapFeature } from 'app/components/Maps/mapUtils';
import { appActions } from 'app/slices/app';
import { selectLastMapLocation } from 'app/slices/app/selectors';
import { FeatureCollection } from 'geojson';
import { useMediaQuery } from 'utils/hooks/useMediaQuery';
import { usePageViewAnalytics } from 'utils/hooks/usePageViewAnalytics';

import { CountryDetailCard } from './CountryDetailCard';
import { CreateFeatureSpeedDial } from './CreateSpeedDial';
import { GuideDetailCard } from './GuideDetailCard';
import { LineDetailCard } from './LineDetailCard';
import { SpotDetailCard } from './SpotDetailCard';
import { useActiveSlacklineFeature } from './useActiveFeature';

const featureGeoJsonDict: { [key: string]: FeatureCollection } = {};

const isFeatureTypeMainFeature = (type: string | undefined) => {
  return ['line', 'spot', 'guide'].includes(type ?? '');
};

export function SlacklineMapPage() {
  usePageViewAnalytics();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeFeatureGeoJson, setActiveFeatureGeoJson] = useState<FeatureCollection>();
  const [highlightedFeature, setHighlightedFeature] = useState<{
    id: string;
    type: SlacklineMapFeatureType;
  }>();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeFeature } = useActiveSlacklineFeature();
  const lastMapLocation = useSelector(selectLastMapLocation);

  const { isDesktop } = useMediaQuery();

  const updateActiveFeatureGeoJson = useCallback(async () => {
    if (!activeFeature) {
      setActiveFeatureGeoJson(undefined);
      return;
    }
    const { id, type } = activeFeature;
    if (isFeatureTypeMainFeature(type)) {
      const featureGeoJson = featureGeoJsonDict[id];
      if (featureGeoJson) {
        setActiveFeatureGeoJson(featureGeoJson);
      }
    } else if (type === 'country') {
      const { geoJson } = await getSlacklinePointFeaturesOfCountry(id);
      setActiveFeatureGeoJson(geoJson);
    }
    if (!isDesktop) {
      window.scrollTo({
        top: window.innerHeight * 0.2,
        behavior: 'smooth',
      });
    }
  }, [activeFeature]);

  const navigateToFeature = useCallback(
    (id: string, type?: SlacklineMapFeatureType) => {
      if (!type) return;

      if (isFeatureTypeMainFeature(type)) {
        navigate(`/${type}/${id}`);
      } else if (type === 'country') {
        navigate(`/country/${id}`);
      }
    },
    [navigate],
  );

  useEffect(() => {
    updateActiveFeatureGeoJson();
  }, [activeFeature]);

  const onSelectedFeatureChange = useCallback(
    (feature?: MapboxGeoJSONFeature) => {
      if (!feature) return;

      const { id, type } = parseMapFeature<SlacklineMapFeatureType>(feature);
      navigateToFeature(id, type);
    },
    [activeFeature],
  );

  const onFeatureDetailsLoaded = useCallback(
    (
      featureDetailsResponse:
        | GetLineDetailsAPIResponse
        | GetSpotDetailsAPIResponse
        | GetGuideDetailsAPIResponse,
    ) => {
      if (!featureDetailsResponse) return;
      featureGeoJsonDict[featureDetailsResponse.id] = featureDetailsResponse.geoJson;

      if (activeFeature?.id === featureDetailsResponse.id) {
        updateActiveFeatureGeoJson();
      }
    },
    [activeFeature, isDesktop],
  );

  const highlightFeature = useCallback(
    (featureId?: string, featureType?: SlacklineMapFeatureType) => {
      if (!featureId || !featureType) {
        setHighlightedFeature(undefined);
        return;
      }
      setHighlightedFeature({ id: featureId, type: featureType });
    },
    [setHighlightedFeature],
  );

  const onMapMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const { longitude, latitude, zoom } = event.viewState;
      dispatch(appActions.updateLastMapLocation({ longitude, latitude, zoom }));
      if (!activeFeature) {
        searchParams.set('map', mapUrlSearchParams.stringify(longitude, latitude, zoom));
        setSearchParams(searchParams, { replace: true });
      }
    },
    [activeFeature, dispatch, searchParams, setSearchParams],
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
        <CreateFeatureSpeedDial />
        <SlacklineMap
          onSelectedFeatureChange={onSelectedFeatureChange}
          onMapMoveEnd={onMapMoveEnd}
          initialViewState={mapUrlSearchParams.parse(searchParams) || lastMapLocation}
          activeSlacklineFeature={activeFeature}
          activeSlacklineFeatureGeoJson={activeFeatureGeoJson}
          highlightedSlacklineFeature={highlightedFeature}
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
          {activeFeature.type === 'line' && (
            <LineDetailCard lineId={activeFeature.id} onDetailsLoaded={onFeatureDetailsLoaded} />
          )}
          {activeFeature.type === 'spot' && (
            <SpotDetailCard spotId={activeFeature.id} onDetailsLoaded={onFeatureDetailsLoaded} />
          )}
          {activeFeature.type === 'guide' && (
            <GuideDetailCard guideId={activeFeature.id} onDetailsLoaded={onFeatureDetailsLoaded} />
          )}
          {activeFeature.type === 'country' && (
            <CountryDetailCard
              countryCode={activeFeature.id}
              onChangelogHover={highlightFeature}
              onChangelogClick={navigateToFeature}
            />
          )}
        </Box>
      )}
    </Stack>
  );
}
