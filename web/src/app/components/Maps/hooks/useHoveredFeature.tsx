import { RefObject, useCallback, useEffect, useState } from 'react';
import { MapRef } from 'react-map-gl';

import { MapboxGeoJSONFeature } from 'mapbox-gl';

import { parseMapFeature } from '../mapUtils';
import { getSourceIdForType } from '../sources/utils';
import { MapFeatureEntity } from '../types';

export interface HoveredFeatureEntity extends MapFeatureEntity {
  size?: 'small' | 'large';
}

export const useHoveredFeature = (mapRef: RefObject<MapRef>) => {
  const [hoveredFeature, setHoveredFeature] = useState<HoveredFeatureEntity>();
  const [lastHoveredFeature, setLastHoveredFeature] = useState<HoveredFeatureEntity>();

  const setHoveredMapboxFeature = useCallback((feature: MapboxGeoJSONFeature) => {
    const { id, type } = parseMapFeature(feature);
    if (id && type) {
      setHoveredFeature({ id, type });
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (lastHoveredFeature && lastHoveredFeature.id !== hoveredFeature?.id) {
      for (const source of getSourceIdForType(lastHoveredFeature.type)) {
        map.removeFeatureState(
          {
            id: lastHoveredFeature.id,
            source,
          },
          'hover',
        );
      }
    }

    if (hoveredFeature) {
      for (const source of getSourceIdForType(hoveredFeature.type)) {
        if (source) {
          map.setFeatureState(
            {
              id: hoveredFeature.id,
              source,
            },
            { hover: hoveredFeature.size || 'small' },
          );
        }
        setLastHoveredFeature(hoveredFeature);
      }
    }
  }, [hoveredFeature, mapRef]);

  return { hoveredFeature, setHoveredMapboxFeature, setHoveredFeature };
};
