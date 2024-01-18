import { useEffect, useState } from 'react';

import { Projection } from 'mapbox-gl';

import { SelectedMapStyle } from '../SlacklineMap/useMapOptions';
import { mapStyles } from '../constants';

export const useMapStyle = (
  zoomLevel?: number,
  opts?: {
    style?: SelectedMapStyle;
  },
) => {
  const pickStyle = (style?: SelectedMapStyle, zoomLevel?: number) => {
    switch (style) {
      case 'default':
        if (!zoomLevel || zoomLevel < 10) {
          return mapStyles.dark;
        }
        return mapStyles.satelliteStreets;
      case 'satellite':
        return mapStyles.satelliteStreets;
      case 'outdoors':
        return mapStyles.outdoors;
      case 'streets':
        return mapStyles.streets;
      default:
        return mapStyles.dark;
    }
  };

  const [mapStyle, setMapStyle] = useState(pickStyle(opts?.style));
  const [projection, setProjection] = useState<Projection>({ name: 'globe' });

  useEffect(() => {
    setMapStyle(pickStyle(opts?.style, zoomLevel));

    if (!zoomLevel || zoomLevel < 6) {
      setProjection({ name: 'globe' });
    } else {
      setProjection({ name: 'mercator' });
    }
  }, [zoomLevel, opts?.style]);

  return { mapStyle, projection };
};
