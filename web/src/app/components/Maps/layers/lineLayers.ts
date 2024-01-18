import { CircleLayer, LineLayer, SymbolLayer } from 'mapbox-gl';
import { appColors } from 'styles/theme/colors';

import { genericCircleLayer, genericLabelLayer, genericLineLayer } from './common';

type CommonOpts = {
  visible?: boolean;
  filter?: any[];
};

export const LineLayerIds = {
  linePoint: 'linePoint',
  lineLine: 'lineLine',
  lineLabel: 'lineLabel',
} as const;

export const linePointLayer = (opts: CommonOpts): CircleLayer => {
  const circleLayer = genericCircleLayer(opts);
  return {
    ...circleLayer,
    id: LineLayerIds.linePoint,
    maxzoom: 13,
    paint: {
      ...circleLayer.paint,
      'circle-color': appColors.lineStrokeColor,
    },
  };
};
export const lineLineStringLayer = (opts: CommonOpts): LineLayer => {
  const lineLayer = genericLineLayer(opts);
  return {
    ...lineLayer,
    id: LineLayerIds.lineLine,
    paint: {
      ...lineLayer.paint,
      'line-color': appColors.lineStrokeColor,
    },
  };
};

export const lineLabelLayer = (opts: CommonOpts): SymbolLayer => {
  const labelLayer = genericLabelLayer(opts);

  return {
    ...labelLayer,
    id: LineLayerIds.lineLabel,
    paint: {
      ...labelLayer.paint,
      'icon-color': appColors.lineStrokeColor,
    },
  };
};
