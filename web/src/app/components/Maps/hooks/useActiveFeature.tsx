import { RefObject, useEffect } from 'react';
import { MapRef } from 'react-map-gl';

import { useMediaQuery } from 'utils/hooks/useMediaQuery';

import { MapFeatureEntity } from '../types';

export const useActiveFeature = (
  mapRef: RefObject<MapRef>,
  isMapLoaded: boolean,
  activeFeature: MapFeatureEntity | undefined,
  selectedFeature: MapFeatureEntity | undefined,
  onShouldUpdateSelectedFeature: (feature: MapFeatureEntity | undefined) => void,
) => {
  const { isDesktop } = useMediaQuery();

  useEffect(() => {
    if (isMapLoaded && activeFeature) {
      if (selectedFeature?.id !== activeFeature.id) {
        onShouldUpdateSelectedFeature({
          id: activeFeature.id,
          type: activeFeature.type,
        });
      }
    }
  }, [isMapLoaded]);

  useEffect(() => {
    if (activeFeature && selectedFeature?.id !== activeFeature.id && isMapLoaded) {
      onShouldUpdateSelectedFeature({
        id: activeFeature.id,
        type: activeFeature.type,
      });
    }

    if (!activeFeature) {
      if (selectedFeature) {
        onShouldUpdateSelectedFeature(undefined);
      }
    }
    if (!isDesktop) {
      mapRef?.current?.resize();
    }
  }, [activeFeature]);
};
