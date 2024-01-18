import { useEffect } from 'react';

import { MapFeatureEntity } from '../types';
import { HoveredFeatureEntity } from './useHoveredFeature';

export const useHighlightedFeature = (
  isMapLoaded: boolean,
  highlightedFeature: MapFeatureEntity | undefined,
  hoveredFeature: HoveredFeatureEntity | undefined,
  onShouldUpdateHoveredFeature: (feature: HoveredFeatureEntity | undefined) => void,
) => {
  useEffect(() => {
    if (highlightedFeature && hoveredFeature?.id !== highlightedFeature.id && isMapLoaded) {
      onShouldUpdateHoveredFeature({
        id: highlightedFeature.id,
        type: highlightedFeature.type,
        size: 'large',
      });
    }

    if (!highlightedFeature) {
      if (hoveredFeature) {
        onShouldUpdateHoveredFeature(undefined);
      }
    }
  }, [highlightedFeature]);
};
