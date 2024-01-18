import { RefObject, useCallback, useEffect, useState } from 'react';
import { MapRef } from 'react-map-gl';

import { MapboxGeoJSONFeature } from 'mapbox-gl';

import { centerMapToFeature, padMapTo, parseMapFeature } from '../mapUtils';
import { getSourceIdForType } from '../sources/utils';
import { MapFeatureEntity } from '../types';

export const useSelectedFeature = (
  mapRef: RefObject<MapRef>,
  opts: {
    centerOnMap?: ((feature: MapFeatureEntity) => boolean) | boolean;
    paddingRight?: number;
  } = {},
) => {
  const [selectedFeature, setSelectedFeature] = useState<MapFeatureEntity>();

  const [lastSelectedFeature, setLastSelectedFeature] = useState<MapFeatureEntity>();

  const setSelectedMapboxFeature = useCallback(
    (feature: MapboxGeoJSONFeature) => {
      const { id, type } = parseMapFeature(feature);
      if (id && type) {
        setSelectedFeature({ id, type });
        if (opts.centerOnMap) {
          const enabled =
            typeof opts.centerOnMap === 'function'
              ? opts.centerOnMap({ id, type })
              : opts.centerOnMap;

          if (!enabled) return;
          centerMapToFeature(mapRef, feature, {
            padding: { right: opts.paddingRight },
          });
        }
      }
    },
    [opts.centerOnMap],
  );

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!selectedFeature && opts.paddingRight) {
      padMapTo(mapRef, {});
    }

    if (lastSelectedFeature && lastSelectedFeature.id !== selectedFeature?.id) {
      for (const source of getSourceIdForType(lastSelectedFeature.type)) {
        map.removeFeatureState(
          {
            id: lastSelectedFeature.id,
            source,
          },
          'isSelected',
        );
      }
    }

    if (selectedFeature) {
      for (const source of getSourceIdForType(selectedFeature.type)) {
        map.setFeatureState(
          {
            id: selectedFeature.id,
            source,
          },
          { isSelected: true },
        );
      }
      setLastSelectedFeature(selectedFeature);
    }
  }, [mapRef, selectedFeature]);

  return { selectedFeature, setSelectedFeature, setSelectedMapboxFeature };
};
