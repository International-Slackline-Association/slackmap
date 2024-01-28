/* eslint-disable @typescript-eslint/no-var-requires */
import { RefObject } from 'react';
import { MapRef } from 'react-map-gl';

import { area, bbox, bboxPolygon, buffer, centerOfMass, getType, round } from '@turf/turf';
import { Feature, FeatureCollection, LineString, Point, Polygon, Position } from 'geojson';
import { FlyToOptions, MapboxGeoJSONFeature, PaddingOptions } from 'mapbox-gl';

import { MapFeatureCommonProperties, MapFeatureEntity } from './types';

export const mapUrlSearchParams = {
  parse: (searchParams: URLSearchParams) => {
    const [longitude, latitude, zoom] =
      searchParams
        .get('map')
        ?.split(',')
        .map((p) => {
          const parsed = parseFloat(p);
          return isNaN(parsed) ? undefined : parsed;
        }) ?? [];

    if (longitude === undefined || latitude === undefined) {
      return undefined;
    }
    return {
      longitude,
      latitude,
      zoom: zoom || 0,
    };
  },
  stringify: (longitude: number, latitude: number, zoom: number) => {
    return `${round(longitude, 5)},${round(latitude, 5)}${zoom ? `,${round(zoom, 5)}` : ''}`;
  },
};

export const parseMapFeature = <T extends MapFeatureEntityType>(feature: MapboxGeoJSONFeature) => {
  let type: MapFeatureEntityType;
  const ft: MapFeatureCommonProperties['ft'] = feature.properties?.['ft'];

  switch (ft) {
    case 'l':
      type = 'line';
      break;
    case 's':
      type = 'spot';
      break;
    case 'g':
      type = 'guide';
      break;
    case 'ct':
      type = 'country';
      break;
    case 'sg':
      type = 'slacklineGroup';
      break;
    case 'isaM':
      type = 'isaMemberGroup';
      break;
    case 'comCt':
      type = 'communityCountry';
      break;
  }

  const center = centerOfMass(feature).geometry.coordinates;

  const mapFeature: MapFeatureEntity<T> = {
    id: feature.properties?.id as string,
    type: type as T,
  };
  return { ...mapFeature, center };
};

export const centerMapToFeature = (
  mapRef: RefObject<MapRef>,
  feature: MapboxGeoJSONFeature | FeatureCollection,
  opts: { padding?: Partial<PaddingOptions> } = {},
) => {
  const center = centerOfMass(feature).geometry.coordinates;
  flyMapTo(mapRef, center, { padding: opts.padding });
};

type BBox = [number, number, number, number];
export const fitMapToGeoJson = (
  mapRef: RefObject<MapRef>,
  geoJson: FeatureCollection,
  opts: {
    animation?: {
      skip: boolean;
    };
    padding?: PaddingOptions;
    minBufferRadiusInKm?: number;
  } = {},
) => {
  if (!geoJson || !mapRef.current) return;
  const map = mapRef.current;

  if (geoJson.features.length === 0) {
    return;
  }

  const bufferKmFromArea = () => {
    const bounds = bbox(geoJson) as BBox;
    const radius = Math.sqrt(area(bboxPolygon(bounds)) / Math.PI) / 1000;
    return Math.max(opts.minBufferRadiusInKm ?? 0, radius);
  };

  let bufferedBounds: BBox;

  if (geoJson.features.length === 1) {
    const feature = geoJson.features[0];
    if (isFeaturePoint(feature)) {
      const radius = Math.max(opts.minBufferRadiusInKm ?? 0, 0.1);
      bufferedBounds = bbox(buffer(geoJson, radius)) as BBox;
    } else if (isFeatureLine(feature)) {
      const length = (parseFloat(feature.properties?.l) || 200) / 1000;
      const radius = Math.max(opts.minBufferRadiusInKm ?? 0, length);
      bufferedBounds = bbox(buffer(geoJson, radius)) as BBox;
    } else if (isFeaturePolygon(feature)) {
      bufferedBounds = bbox(buffer(geoJson, bufferKmFromArea())) as BBox;
    } else {
      bufferedBounds = bbox(buffer(geoJson, bufferKmFromArea())) as BBox;
    }
  } else {
    bufferedBounds = bbox(buffer(geoJson, bufferKmFromArea())) as BBox;
  }

  map.fitBounds(bufferedBounds, {
    animate: opts.animation?.skip ? false : true,
    padding: opts.padding,
  });
};

export const flyMapTo = (
  mapRef: RefObject<MapRef>,
  position: Position,
  opts: { zoom?: number; padding?: Partial<PaddingOptions> } = {},
) => {
  const map = mapRef.current;
  const params: FlyToOptions = {
    center: [position[0], position[1]],
    duration: 300,
  };
  if (opts.zoom) params.zoom = opts.zoom;
  if (opts.padding)
    params.padding = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      ...opts.padding,
    };
  map?.flyTo(params);
};

export const padMapTo = (
  mapRef: RefObject<MapRef>,
  padding: Partial<PaddingOptions>,
  opts: {
    animate?: boolean;
  } = {},
) => {
  if (!mapRef.current) return;
  const map = mapRef.current;

  map.easeTo({
    padding: {
      top: padding.top || 0,
      bottom: padding.bottom || 0,
      left: padding.left || 0,
      right: padding.right || 0,
    },
    duration: 300,
    animate: opts.animate,
  });
};

export const zoomToUserLocation = async (
  mapRef: RefObject<MapRef>,
  opts: { zoom?: number } = {},
) => {
  const response = await fetch('https://ipapi.co/json/')
    .then((r) =>
      r.json().then((data) => ({
        longitude: data.longitude as number,
        latitude: data.latitude as number,
        zoom: opts.zoom,
      })),
    )
    .catch(() => undefined);
  if (response) {
    flyMapTo(mapRef, [response.longitude, response.latitude], {
      zoom: response.zoom,
    });
  }
};

const isFeaturePoint = (feature: Feature): feature is Feature<Point> => {
  return getType(feature) === 'Point';
};

const isFeatureLine = (feature: Feature): feature is Feature<LineString> => {
  return getType(feature) === 'LineString';
};

const isFeaturePolygon = (feature: Feature): feature is Feature<Polygon> => {
  return getType(feature) === 'Polygon';
};
