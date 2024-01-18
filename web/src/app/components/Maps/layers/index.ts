import { CountryLayerIds } from './countryLayers';
import { GuideLayerIds } from './guideLayers';
import { LineLayerIds } from './lineLayers';
import { SlacklineGroupsLayerIds } from './slacklineGroupsLayer';
import { SpotLayerIds } from './spotLayers';

export const cursorInteractableLayerIds = [
  LineLayerIds.linePoint,
  LineLayerIds.lineLine,
  LineLayerIds.lineLabel,
  SpotLayerIds.spotPoint,
  SpotLayerIds.spotPolygon,
  SpotLayerIds.spotOutline,
  GuideLayerIds.guidePointGlobal,
  GuideLayerIds.guidePoint,
  GuideLayerIds.guideLine,
  GuideLayerIds.guidePolygon,
  GuideLayerIds.guideLabel,
  GuideLayerIds.guidePolygonOutline,
  CountryLayerIds.countryPoint,
  SlacklineGroupsLayerIds.groupPoint,
];

export const isMouseHoverableLayer = (layerId: string) =>
  cursorInteractableLayerIds.includes(layerId as any);

export const isCursorInteractableLayer = (layerId: string) =>
  cursorInteractableLayerIds.includes(layerId as any);
