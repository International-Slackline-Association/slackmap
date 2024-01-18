import { RefObject, useEffect } from 'react';
import { MapRef } from 'react-map-gl';

import { FeatureCollection } from 'geojson';
import { useMediaQuery } from 'utils/hooks/useMediaQuery';

import { MAP_PADDING_RIGHT_FOR_FEATURE_CARD } from '../constants';
import { fitMapToGeoJson, padMapTo } from '../mapUtils';

export const useActiveFeatureGeoJson = (
  mapRef: RefObject<MapRef>,
  isMapLoaded: boolean,
  activeFeatureGeoJson: FeatureCollection | undefined,
  opts: {
    paddingType: {
      padExplicityly?: boolean;
      padOnFit?: boolean;
    };
    minBufferRadiusInKm?: number;
  },
) => {
  const { isDesktop } = useMediaQuery();

  useEffect(() => {
    if (activeFeatureGeoJson) {
      const rightPadding = isDesktop ? MAP_PADDING_RIGHT_FOR_FEATURE_CARD : 0;
      const padding = {
        top: 0,
        left: 0,
        bottom: 0,
        right: rightPadding,
      };
      const currentPadding = mapRef.current?.getPadding().right;

      if (opts.paddingType.padExplicityly) {
        if (rightPadding && !currentPadding) {
          padMapTo(mapRef, padding, { animate: false });
        }
        fitMapToGeoJson(mapRef, activeFeatureGeoJson, {
          animation: {
            skip: !isMapLoaded,
          },
          minBufferRadiusInKm: opts.minBufferRadiusInKm,
        });
      } else {
        if (currentPadding) {
          padMapTo(mapRef, {}, { animate: false });
        }
        fitMapToGeoJson(mapRef, activeFeatureGeoJson, {
          animation: {
            skip: !isMapLoaded,
          },
          padding: opts.paddingType.padOnFit ? padding : undefined,
          minBufferRadiusInKm: opts.minBufferRadiusInKm,
        });
      }
    } else {
      padMapTo(mapRef, {});
    }
  }, [activeFeatureGeoJson, isDesktop]);
};
