import { CommunityMapSourceIds } from './commnunityMapSources';
import { SlacklineMapSourceIds } from './slacklineMapSources';

export const getSourceIdForType = (type: MapFeatureEntityType): string[] => {
  switch (type) {
    case 'line':
      return [SlacklineMapSourceIds.lines, SlacklineMapSourceIds.linePoints];
    case 'spot':
      return [SlacklineMapSourceIds.spots, SlacklineMapSourceIds.spotPoints];
    case 'guide':
      return [SlacklineMapSourceIds.guides, SlacklineMapSourceIds.guidePoints];
    case 'country':
      return [SlacklineMapSourceIds.countryPoints];
    case 'activity':
      return [];
    case 'slacklineGroup':
    case 'isaMemberGroup':
      return [CommunityMapSourceIds.slacklineGroups];
    case 'communityCountry':
      return [CommunityMapSourceIds.communityCountries];
  }
};
