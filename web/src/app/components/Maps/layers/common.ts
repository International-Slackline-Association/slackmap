import { CircleLayer, FillLayer, LineLayer, SymbolLayer } from 'mapbox-gl';

type CommonOpts = {
  visible?: boolean;
  filter?: any[];
};

const filterExprs = {
  point: [
    'any',
    ['==', ['geometry-type'], 'Point'],
    ['==', ['geometry-type'], 'MultiPoint'],
  ] as any[],
  line: ['any', ['==', ['geometry-type'], 'LineString']] as any[],
  polygon: [
    'any',
    ['==', ['geometry-type'], 'Polygon'],
    ['==', ['geometry-type'], 'MultiPolygon'],
  ] as any[],
};

export const genericCircleLayer = (opts: { big?: boolean } & CommonOpts): CircleLayer => {
  let filter = filterExprs.point;
  if (opts.filter) {
    filter = ['all', filterExprs.point, opts.filter];
  }
  return {
    id: 'genericCircle',
    type: 'circle',
    filter,
    layout: {
      visibility: opts.visible ? 'visible' : 'none',
    },
    paint: {
      'circle-radius': [
        'interpolate',
        ['exponential', 1],
        ['zoom'],
        1,
        [
          'case',
          ['==', ['feature-state', 'hover'], 'large'],
          opts.big ? 12 : 9,
          ['==', ['feature-state', 'hover'], 'small'],
          opts.big ? 7 : 4,
          ['boolean', ['feature-state', 'isSelected'], false],
          opts.big ? 8 : 5,
          opts.big ? 1 : 0.7,
        ],
        7,
        [
          'case',
          ['==', ['feature-state', 'hover'], 'large'],
          opts.big ? 13 : 9,
          ['==', ['feature-state', 'hover'], 'small'],
          opts.big ? 10 : 5,
          ['boolean', ['feature-state', 'isSelected'], false],
          opts.big ? 13 : 6,
          opts.big ? 8 : 4,
        ],
        12,
        [
          'case',
          ['==', ['feature-state', 'hover'], 'large'],
          opts.big ? 15 : 11,
          ['==', ['feature-state', 'hover'], 'small'],
          opts.big ? 12 : 9,
          ['boolean', ['feature-state', 'isSelected'], false],
          opts.big ? 15 : 12,
          opts.big ? 10 : 7,
        ],
      ],
      'circle-opacity': 0.8,
      'circle-stroke-width': ['interpolate', ['exponential', 1], ['zoom'], 1, 0, 5, 0.3, 7, 1],
      'circle-stroke-color': 'white',
    },
  };
};

export const genericLineLayer = (opts: CommonOpts): LineLayer => {
  return {
    id: 'genericLine',
    type: 'line',
    minzoom: 12,
    filter: opts.filter ? opts.filter : filterExprs.line,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
      visibility: opts.visible ? 'visible' : 'none',
    },
    paint: {
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'isSelected'], false],
        6,
        [
          'any',
          ['==', ['feature-state', 'hover'], 'small'],
          ['==', ['feature-state', 'hover'], 'large'],
        ],
        4,
        2,
      ],
      'line-opacity': [
        'case',
        [
          'boolean',
          [
            'any',
            ['==', ['feature-state', 'hover'], 'small'],
            ['==', ['feature-state', 'hover'], 'large'],
          ],
          ['feature-state', 'isSelected'],
          false,
        ],
        1,
        0.8,
      ],
    },
  };
};

export const genericFillLayer = (opts: CommonOpts): FillLayer => {
  return {
    id: 'genericFill',
    type: 'fill',
    minzoom: 12,
    filter: opts.filter ? opts.filter : filterExprs.polygon,
    paint: {
      'fill-opacity': [
        'case',
        ['any', ['boolean', ['feature-state', 'isSelected'], false]],
        0.8,
        [
          'any',
          ['==', ['feature-state', 'hover'], 'small'],
          ['==', ['feature-state', 'hover'], 'large'],
        ],
        0.8,
        0.4,
      ],
    },
  };
};

export const genericSymbolLayer = (opts: CommonOpts): SymbolLayer => {
  return {
    id: 'genericSymbol',
    type: 'symbol',
    layout: {
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'icon-text-fit': 'none',
      'icon-allow-overlap': true,
      visibility: opts.visible ? 'visible' : 'none',
    },
    paint: {
      'text-color': 'white',
      'text-halo-color': 'black',
      'icon-opacity': [
        'case',
        [
          'boolean',
          [
            'any',
            ['==', ['feature-state', 'hover'], 'small'],
            ['==', ['feature-state', 'hover'], 'large'],
          ],
          ['feature-state', 'isSelected'],
          false,
        ],
        1,
        0.9,
      ],
    },
  };
};

export const genericLabelLayer = (opts: CommonOpts): SymbolLayer => {
  const symbolLayer = genericSymbolLayer(opts);
  return {
    ...symbolLayer,
    id: 'genericLabel',
    minzoom: 14,
    filter: opts.filter ? ['all', opts.filter, ['has', 'l']] : ['has', 'l'],
    layout: {
      ...symbolLayer.layout,
      'icon-image': 'marker',
      'symbol-placement': 'line-center',
      'text-field': '{l}',
      'text-size': 12,
      'text-allow-overlap': true,
      'icon-text-fit': 'both',
      'icon-text-fit-padding': [8, 8, 8, 8],
    },
  };
};
