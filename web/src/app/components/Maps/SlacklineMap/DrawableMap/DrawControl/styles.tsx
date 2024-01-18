import { appColors } from 'styles/theme/colors';

export const drawControlStyles = (drawingFeatureType: 'line' | 'guide' | 'spot') => {
  const lineStrokeColor =
    drawingFeatureType === 'guide' ? appColors.guideFeaturesColor : appColors.lineStrokeColor;
  const spotFillColor =
    drawingFeatureType === 'guide' ? appColors.guideFeaturesColor : appColors.spotFillColor;

  const lineDash = drawingFeatureType === 'guide' ? [0.2, 2] : [1];

  const styles = [
    {
      id: 'active-points',
      type: 'circle',
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'true'],
      ],
      paint: {
        'circle-radius': 7,
        'circle-color': lineStrokeColor,
        'circle-opacity': 1,
      },
    },
    {
      id: 'inactive-points',
      type: 'circle',
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'false'],
      ],
      paint: {
        'circle-radius': 7,
        'circle-color': lineStrokeColor,
        'circle-opacity': 0.8,
      },
    },

    // ACTIVE (being drawn)
    // line stroke
    {
      id: 'gl-draw-line',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': lineStrokeColor,
        'line-dasharray': lineDash,
        'line-width': 2,
        'line-opacity': 1,
      },
    },
    // polygon fill
    {
      id: 'gl-draw-polygon-fill',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      paint: {
        'fill-color': spotFillColor,
        // 'fill-outline-color': appColors.spotFillColor,
        'fill-opacity': 0.8,
      },
    },
    // polygon outline stroke
    // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
    {
      id: 'gl-draw-polygon-stroke-active',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': spotFillColor,
        // 'line-dasharray': [0.2, 2],
        'line-width': 2,
      },
    },

    // INACTIVE (static, already drawn)
    // line stroke
    {
      id: 'gl-draw-line-static',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': lineStrokeColor,
        'line-width': 3,
      },
    },
    // polygon fill
    {
      id: 'gl-draw-polygon-fill-static',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
      paint: {
        'fill-color': appColors.spotFillColor,
        // 'fill-outline-color': appColors.lineStrokeColor,
        'fill-opacity': 0.1,
      },
    },
    // polygon outline
    {
      id: 'gl-draw-polygon-stroke-static',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': appColors.lineStrokeColor,
        'line-width': 3,
      },
    },
    // polygon mid points
    {
      id: 'gl-draw-polygon-midpoint',
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
      paint: {
        'circle-radius': 3,
        'circle-color': '#fbb03b',
      },
    },
    // vertex point halos
    {
      id: 'gl-draw-polygon-and-line-vertex-halo-active',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 5,
        'circle-color': '#FFF',
      },
    },
    // vertex points
    {
      id: 'gl-draw-polygon-and-line-vertex-active',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 5,
        'circle-color': '#D20C0C',
      },
    },
  ];
  return styles;
};
