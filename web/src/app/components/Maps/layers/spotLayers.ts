import { CircleLayer, FillLayer, LineLayer } from 'mapbox-gl';
import { appColors } from 'styles/theme/colors';

import { genericCircleLayer, genericFillLayer, genericLineLayer } from './common';

type CommonOpts = {
  visible?: boolean;
  filter?: any[];
};

export const SpotLayerIds = {
  spotPoint: 'spotPoint',
  spotPolygon: 'spotPolygon',
  spotOutline: 'spotOutline',
} as const;

export const spotPointLayer = (opts: CommonOpts): CircleLayer => {
  const circleLayer = genericCircleLayer(opts);
  return {
    ...circleLayer,
    id: SpotLayerIds.spotPoint,
    maxzoom: 13,
    paint: {
      ...circleLayer.paint,
      'circle-color': appColors.spotFillColor,
    },
  };
};
export const spotPolygonLayer = (opts: CommonOpts): FillLayer => {
  const fillLayer = genericFillLayer(opts);
  return {
    ...fillLayer,
    id: SpotLayerIds.spotPolygon,
    paint: {
      ...fillLayer.paint,
      'fill-color': appColors.spotFillColor,
    },
  };
};

export const spotPolygonOutlineLayer = (opts: CommonOpts): LineLayer => {
  const lineLayer = genericLineLayer(opts);

  return {
    ...lineLayer,
    id: SpotLayerIds.spotOutline,
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      ...lineLayer.paint,
      'line-width': 2,
      'line-opacity': 1,
      'line-color': appColors.spotFillColor,
    },
  };
};
