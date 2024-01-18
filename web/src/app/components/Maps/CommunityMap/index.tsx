import { useRef, useState } from 'react';
import {
  AttributionControl,
  GeolocateControl,
  MapboxGeoJSONFeature,
  NavigationControl,
  Map as ReactMapGL,
} from 'react-map-gl';
import type { MapRef } from 'react-map-gl';

import { Box } from '@mui/material';

import type { FeatureCollection } from 'geojson';

import { MapLogo } from '../Components/Logo';
import { MapImage } from '../Components/MapImage';
import { MapLoadingPlaceholder } from '../Components/MapLoadingPlaceholder';
import { defaultMapSettings, defaultMapViewState } from '../constants';
import { useActiveFeature } from '../hooks/useActiveFeature';
import { useActiveFeatureGeoJson } from '../hooks/useActiveFeatureGeoJson';
import { useHoveredFeature } from '../hooks/useHoveredFeature';
import { useMapEvents } from '../hooks/useMapEvents';
import { useMapStyle } from '../hooks/useMapStyle';
import { useSelectedFeature } from '../hooks/useSelectedFeature';
import { useZoomToUserLocationOnMapLoad } from '../hooks/useZoomToUserLocation';
import { isMouseHoverableLayer } from '../layers';
import { CountryLayerIds } from '../layers/countryLayers';
import { SlacklineGroupsLayerIds } from '../layers/slacklineGroupsLayer';
import { CommunityMapSources } from '../sources/commnunityMapSources';
import { MapFeatureEntity } from '../types';
import { CommunityMapLegend } from './Legend';

interface Props {
  onSelectedFeatureChange?: (feature?: MapboxGeoJSONFeature) => void;
  activeCommunityFeature?: MapFeatureEntity<CommunityMapFeatureType>;
  activeCommunityFeatureGeoJson?: FeatureCollection;
}

export const CommunityMap = (props: Props) => {
  const mapRef = useRef<MapRef>(null);
  const [zoomLevel, setZoomLevel] = useState<number>();

  const { projection, mapStyle } = useMapStyle(zoomLevel, {});

  const { setHoveredFeature, setHoveredMapboxFeature } = useHoveredFeature(mapRef);
  const { setSelectedMapboxFeature, setSelectedFeature, selectedFeature } =
    useSelectedFeature(mapRef);
  const { isMapLoaded, onMapLoad, onMouseMove, onMapClick, cursor } = useMapEvents(mapRef, {
    onMouseMovedToFeature(feature) {
      if (isMouseHoverableLayer(feature.layer.id)) {
        setHoveredMapboxFeature(feature);
      }
    },
    onMouseMovedToVoid() {
      setHoveredFeature(undefined);
    },
    onClickedToVoid() {
      setSelectedFeature(undefined);
      props.onSelectedFeatureChange?.(undefined);
    },
    onClickedToFeature(feature) {
      setSelectedMapboxFeature(feature);
      props.onSelectedFeatureChange?.(feature);
    },
  });

  useZoomToUserLocationOnMapLoad(mapRef, isMapLoaded, Boolean(props.activeCommunityFeatureGeoJson));

  useActiveFeature(
    mapRef,
    isMapLoaded,
    props.activeCommunityFeature,
    selectedFeature,
    setSelectedFeature,
  );

  useActiveFeatureGeoJson(mapRef, isMapLoaded, props.activeCommunityFeatureGeoJson, {
    paddingType: {
      padExplicityly: props.activeCommunityFeature?.type === 'communityCountry',
      padOnFit: true,
    },
    minBufferRadiusInKm: 100,
  });

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        '& .mapboxgl-ctrl-logo': {
          display: 'none',
        },
      }}
    >
      {!isMapLoaded && <MapLoadingPlaceholder pad={Boolean(props.activeCommunityFeature)} />}
      <MapLogo />
      {isMapLoaded && <CommunityMapLegend />}
      <ReactMapGL
        {...defaultMapSettings}
        initialViewState={defaultMapViewState}
        mapStyle={mapStyle}
        interactiveLayerIds={[SlacklineGroupsLayerIds.groupPoint, CountryLayerIds.countryPoint]}
        onLoad={onMapLoad}
        onClick={onMapClick}
        onMouseMove={onMouseMove}
        cursor={cursor}
        ref={mapRef}
        projection={projection}
        onZoom={(e) => {
          setZoomLevel(e.viewState.zoom);
        }}
      >
        <GeolocateControl />
        <AttributionControl compact customAttribution="International Slackline Association" />
        <NavigationControl />
        <MapImage name={'country-symbol'} url={'/images/country-symbol.png'} />
        <CommunityMapSources
          filter={{
            country:
              props.activeCommunityFeature?.type === 'communityCountry'
                ? props.activeCommunityFeature?.id
                : undefined,
          }}
        />
      </ReactMapGL>
    </Box>
  );
};
