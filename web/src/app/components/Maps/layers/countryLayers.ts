import { LineLayer, SymbolLayer } from 'mapbox-gl';
import { appColors } from 'styles/theme/colors';

import { genericSymbolLayer } from './common';

type CommonOpts = {
  visible?: boolean;
  filter?: any[];
};

export const CountryLayerIds = {
  countryPoint: 'countryPoint',
  countryPolygonOutline: 'countryPolygonOutline',
} as const;

export const countryPointLayer = (opts: CommonOpts): SymbolLayer => {
  const symbolLayer = genericSymbolLayer(opts);

  return {
    ...symbolLayer,
    id: CountryLayerIds.countryPoint,
    layout: {
      ...symbolLayer.layout,
      'icon-image': 'country-symbol',
      'symbol-placement': 'point',
      'icon-allow-overlap': false,
      'text-field': '{id}',
      'text-size': ['interpolate', ['exponential', 1], ['zoom'], 0, 8, 7, 12, 13, 16],
      'text-offset': [
        'interpolate',
        ['exponential', 1],
        ['zoom'],
        0,
        ['literal', [0, -1.3]],
        7,
        ['literal', [0, -2]],
        13,
        ['literal', [0, -2.5]],
      ],
      'icon-size': ['interpolate', ['exponential', 1], ['zoom'], 1, 0.8, 8, 0.8, 13, 0.4],
    },
  };
};

export const countryPolygonOutlineLayer = (): LineLayer => {
  return {
    id: CountryLayerIds.countryPolygonOutline,
    type: 'line',
    filter: [
      'any',
      ['==', ['geometry-type'], 'Polygon'],
      ['==', ['geometry-type'], 'MultiPolygon'],
    ],
    paint: {
      'line-width': 2,
      'line-opacity': 1,
      'line-color': appColors.countryColor,
      'line-dasharray': [1, 1],
    },
  };
};
