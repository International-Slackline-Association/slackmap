import { RefObject, useCallback, useState } from 'react';
import { MapRef } from 'react-map-gl';

import { MapLayerMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';

import { isCursorInteractableLayer } from '../layers';

export const useMapEvents = (
  mapRef: RefObject<MapRef>,
  opts: {
    onMouseMovedToFeature?: (feature: MapboxGeoJSONFeature) => void;
    onMouseMovedToVoid?: () => void;
    onClickedToFeature?: (feature: MapboxGeoJSONFeature) => void;
    onClickedToVoid?: () => void;
  } = {},
) => {
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [cursor, setCursor] = useState('auto');

  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const onMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!isMapLoaded) return;

      const feature = event.features?.[0];
      if (!feature) {
        opts.onMouseMovedToVoid?.();
        setCursor('auto');
        return;
      }
      if (isCursorInteractableLayer(feature.layer.id)) {
        setCursor('pointer');
      }
      opts.onMouseMovedToFeature?.(feature);
    },
    [isMapLoaded, opts],
  );

  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!isMapLoaded) return;

      const feature = event.features?.[0];
      if (!feature) {
        opts.onClickedToVoid?.();
        return;
      }

      opts.onClickedToFeature?.(feature);
    },
    [isMapLoaded, mapRef, opts],
  );

  return {
    onMapLoad,
    isMapLoaded,
    onMouseMove,
    onMapClick,
    cursor,
  };
};
