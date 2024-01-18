import { CircleLayer, FillLayer, LineLayer, SymbolLayer } from 'mapbox-gl';
import { appColors } from 'styles/theme/colors';

import {
  genericCircleLayer,
  genericFillLayer,
  genericLabelLayer,
  genericLineLayer,
} from './common';

type CommonOpts = {
  visible?: boolean;
  filter?: any[];
};

export const GuideLayerIds = {
  guidePointGlobal: 'guidePointGlobal',
  guidePoint: 'guidePoint',
  guideLine: 'guideLine',
  guideLabel: 'guideLabel',
  guidePolygon: 'guidePolygon',
  guidePolygonOutline: 'guidePolygonOutline',
} as const;

export const guidePointLayer = (opts: { isGlobalView?: boolean } & CommonOpts): CircleLayer => {
  const circleLayer = genericCircleLayer(opts);

  const minzoom = opts.isGlobalView ? 0 : 13;
  const maxzoom = opts.isGlobalView ? 13 : 22;
  const id = opts.isGlobalView ? GuideLayerIds.guidePointGlobal : GuideLayerIds.guidePoint;
  return {
    ...circleLayer,
    id: id,
    minzoom,
    maxzoom,
    paint: {
      ...circleLayer.paint,
      'circle-color': appColors.guideFeaturesColor,
    },
  };
};
export const guideLineStringLayer = (opts: CommonOpts): LineLayer => {
  const lineLayer = genericLineLayer(opts);
  return {
    ...lineLayer,
    id: GuideLayerIds.guideLine,
    paint: {
      ...lineLayer.paint,
      'line-color': appColors.guideFeaturesColor,
      // 'line-opacity': 1,
    },
  };
};

export const guideLabelLayer = (opts: CommonOpts): SymbolLayer => {
  const labelLayer = genericLabelLayer(opts);

  return {
    ...labelLayer,
    id: GuideLayerIds.guideLabel,
    paint: {
      ...labelLayer.paint,
      'icon-color': appColors.guideFeaturesColor,
    },
  };
};

export const guidePolygonLayer = (opts: CommonOpts): FillLayer => {
  const fillLayer = genericFillLayer(opts);
  return {
    ...fillLayer,
    id: GuideLayerIds.guidePolygon,
    paint: {
      ...fillLayer.paint,
      'fill-color': appColors.guideFeaturesColor,
    },
  };
};

export const guidePolygonOutlineLayer = (opts: CommonOpts): LineLayer => {
  const lineLayer = genericLineLayer(opts);

  return {
    ...lineLayer,
    id: GuideLayerIds.guidePolygonOutline,
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      ...lineLayer.paint,
      'line-width': 2,
      'line-opacity': 1,
      'line-color': appColors.guideFeaturesColor,
    },
  };
};
