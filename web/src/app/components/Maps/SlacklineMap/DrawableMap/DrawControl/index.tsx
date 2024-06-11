import { forwardRef, useImperativeHandle } from 'react';
import { useControl } from 'react-map-gl';
import type { ControlPosition } from 'react-map-gl';

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import StaticDrawMode from '@mapbox/mapbox-gl-draw-static-mode';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Feature } from 'geojson';

export interface MapboxDrawEvent {
  features: Feature[];
  action?: string;
}

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  onCreate?: (evt: MapboxDrawEvent) => void;
  onUpdate?: (evt: MapboxDrawEvent) => void;
  onDelete?: (evt: MapboxDrawEvent) => void;
  onSelectionChange?: (evt: MapboxDrawEvent) => void;
  styles: object[];
};

// eslint-disable-next-line react/display-name
export const DrawControl = forwardRef((props: DrawControlProps, ref: any) => {
  const drawRef = useControl<MapboxDraw>(
    () =>
      new MapboxDraw({
        ...props,
        styles: props.styles,
        modes: {
          ...MapboxDraw.modes,
          static: StaticDrawMode,
        },
      }),
    ({ map }) => {
      map.on('draw.create', props.onCreate ?? (() => {}));
      map.on('draw.update', props.onUpdate ?? (() => {}));
      map.on('draw.delete', props.onDelete ?? (() => {}));
      map.on('draw.selectionchange', props.onSelectionChange ?? (() => {}));
    },
    ({ map }) => {
      map.off('draw.create', props.onCreate ?? (() => {}));
      map.off('draw.update', props.onUpdate ?? (() => {}));
      map.off('draw.delete', props.onDelete ?? (() => {}));
      map.on('draw.selectionchange', props.onSelectionChange ?? (() => {}));
    },
    {
      position: props.position || 'bottom-right',
    },
  );
  useImperativeHandle(ref, () => drawRef, [drawRef]);

  return null;
});
