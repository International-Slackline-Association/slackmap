import { CircleLayer } from 'mapbox-gl';
import { appColors } from 'styles/theme/colors';

import { genericCircleLayer } from './common';

type CommonOpts = {
  visible?: boolean;
  filter?: any[];
};

export const SlacklineGroupsLayerIds = {
  groupPoint: 'groupPoint',
} as const;

export const slacklineGroupsPointLayer = (opts: CommonOpts): CircleLayer => {
  const circleLayer = genericCircleLayer({ big: true, ...opts });
  return {
    ...circleLayer,
    id: SlacklineGroupsLayerIds.groupPoint,
    paint: {
      ...circleLayer.paint,
      'circle-color': [
        'case',
        ['==', ['get', 'ft'], 'isaM'],
        appColors.isaMemberGroupColor,
        appColors.slacklineGroupColor,
      ],
    },
  };
};
