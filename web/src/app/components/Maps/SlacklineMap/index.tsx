import { useRef, useState } from 'react';
import {
  AttributionControl,
  GeolocateControl,
  MapboxGeoJSONFeature,
  NavigationControl,
  Map as ReactMapGL,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';
import type { MapRef } from 'react-map-gl';

import { Box } from '@mui/material';

import type { FeatureCollection } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';

import { MapLogo } from '../Components/Logo';
import { MapImage } from '../Components/MapImage';
import { MapLoadingPlaceholder } from '../Components/MapLoadingPlaceholder';
import { MAPBOX_TOKEN, defaultMapSettings, defaultMapViewState } from '../constants';
import { useActiveFeature } from '../hooks/useActiveFeature';
import { useActiveFeatureGeoJson } from '../hooks/useActiveFeatureGeoJson';
import { useHighlightedFeature } from '../hooks/useHighlightedFeature';
import { useHoveredFeature } from '../hooks/useHoveredFeature';
import { useMapEvents } from '../hooks/useMapEvents';
import { useMapStyle } from '../hooks/useMapStyle';
import { useSelectedFeature } from '../hooks/useSelectedFeature';
import { useZoomToUserLocationOnMapLoad } from '../hooks/useZoomToUserLocation';
import { cursorInteractableLayerIds, isMouseHoverableLayer } from '../layers';
import { SlacklineMapSources } from '../sources/slacklineMapSources';
import { MapFeatureEntity } from '../types';
import { SlacklineMapLegend } from './Legend';
import { GeocoderControl } from './geocoderControl';
import { useMapOptions } from './useMapOptions';

interface Props {
  onMapMoveEnd?: (event: ViewStateChangeEvent) => void;
  initialViewState?: Partial<ViewState>;
  onSelectedFeatureChange?: (feature?: MapboxGeoJSONFeature) => void;
  activeSlacklineFeature?: MapFeatureEntity<SlacklineMapFeatureType>;
  highlightedSlacklineFeature?: MapFeatureEntity<SlacklineMapFeatureType>;
  activeSlacklineFeatureGeoJson?: FeatureCollection;
}

export const SlacklineMap = (props: Props) => {
  const mapRef = useRef<MapRef>(null);
  const [zoomLevel, setZoomLevel] = useState(props.initialViewState?.zoom);

  const { MapOptionsComponent, selectedDisplayFeature, selectedSlacklineType, selectedMapStyle } =
    useMapOptions();

  const { mapStyle, projection } = useMapStyle(zoomLevel, {
    style: selectedMapStyle,
  });

  const { hoveredFeature, setHoveredMapboxFeature, setHoveredFeature } = useHoveredFeature(mapRef);
  const { selectedFeature, setSelectedFeature, setSelectedMapboxFeature } =
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
    onClickedToFeature(feature) {
      if (isMouseHoverableLayer(feature.layer.id)) {
        setSelectedMapboxFeature(feature);
        props.onSelectedFeatureChange?.(feature);
      }
    },
  });
  useActiveFeature(
    mapRef,
    isMapLoaded,
    props.activeSlacklineFeature,
    selectedFeature,
    setSelectedFeature,
  );

  useHighlightedFeature(
    isMapLoaded,
    props.highlightedSlacklineFeature,
    hoveredFeature,
    setHoveredFeature,
  );

  useZoomToUserLocationOnMapLoad(
    mapRef,
    isMapLoaded,
    Boolean(props.initialViewState) || Boolean(props.activeSlacklineFeature),
  );

  useActiveFeatureGeoJson(mapRef, isMapLoaded, props.activeSlacklineFeatureGeoJson, {
    paddingType: {
      padExplicityly: props.activeSlacklineFeature?.type === 'country',
      padOnFit: true,
    },
  });

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        '& .mapboxgl-ctrl-top-left': {
          'margin-left': { xs: '20%', lg: 0 },
          'margin-right': { xs: '18%', lg: 'auto' },
        },
        '& .mapboxgl-ctrl-geocoder': {
          'margin-top': { xs: '20px', lg: '10px' },
          'margin-left': { xs: '0', lg: '10px' },
        },
        '& .mapboxgl-ctrl-geocoder--input': {
          height: { xs: 'unset', lg: '36px' },
          fontSize: { xs: '1rem' },
        },
        '& .mapboxgl-ctrl-geocoder--icon-search': {
          height: { xs: '15px', lg: '15px' },
          top: { xs: '12px', lg: '12px' },
        },

        '& .mapboxgl-ctrl-logo': {
          display: 'none',
        },
      }}
    >
      {!isMapLoaded && <MapLoadingPlaceholder pad={Boolean(props.activeSlacklineFeature)} />}
      <MapLogo />
      {isMapLoaded && !props.activeSlacklineFeature && <SlacklineMapLegend />}
      {MapOptionsComponent}
      <ReactMapGL
        {...defaultMapSettings}
        initialViewState={props.initialViewState || defaultMapViewState}
        mapStyle={mapStyle}
        interactiveLayerIds={cursorInteractableLayerIds}
        onLoad={onMapLoad}
        onClick={onMapClick}
        onMoveEnd={props.onMapMoveEnd}
        onMouseMove={onMouseMove}
        cursor={cursor}
        onZoom={(e) => {
          setZoomLevel(e.viewState.zoom);
        }}
        ref={mapRef}
        projection={projection}
      >
        <GeolocateControl />
        <AttributionControl compact customAttribution="International Slackline Association" />
        <NavigationControl />
        <GeocoderControl
          mapboxAccessToken={MAPBOX_TOKEN}
          position="top-left"
          placeholder="Search location..."
          marker={false}
          minLength={3}
        />
        <MapImage name={'marker'} url={'/images/line-marker.png'} sdf />
        <MapImage name={'country-symbol'} url={'/images/country-symbol.png'} />

        <SlacklineMapSources
          displayFeature={selectedDisplayFeature}
          filter={{
            country:
              props.activeSlacklineFeature?.type === 'country'
                ? props.activeSlacklineFeature?.id
                : undefined,
            lineType: selectedSlacklineType !== 'none' ? selectedSlacklineType : undefined,
          }}
        />
      </ReactMapGL>
    </Box>
  );
};
