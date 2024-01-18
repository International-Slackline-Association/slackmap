import { RefObject, useEffect, useState } from 'react';
import { MapRef } from 'react-map-gl';

import { useMediaQuery } from 'utils/hooks/useMediaQuery';

import { zoomToUserLocation } from '../mapUtils';

type MapRefType = RefObject<MapRef>;

export const useZoomToUserLocationOnMapLoad = (
  mapRef: MapRefType,
  isMapLoaded: boolean,
  skip?: boolean,
) => {
  const { isDesktop } = useMediaQuery();
  const [hasAlreadyZoomed, setHasAlreadyZoomed] = useState(false);

  useEffect(() => {
    if (!mapRef.current || skip || hasAlreadyZoomed) {
      return;
    }
    if (isMapLoaded) {
      zoomToUserLocation(mapRef, { zoom: isDesktop ? 2.5 : 1.5 });
      setHasAlreadyZoomed(true);
    }
  }, [isMapLoaded]);
};
