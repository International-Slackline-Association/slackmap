type UserIdentityType = 'individual' | 'organization';
type SlacklineType =
  | 'highline'
  | 'waterline'
  | 'midline'
  | 'longline'
  | 'trickline'
  | 'rodeoline'
  | 'parkline'
  | 'other';
type SlacklineRestrictionLevel = 'partial' | 'full' | 'none';
type SlacklineMapFeatureType = 'line' | 'spot' | 'guide' | 'country';
type CommunityMapFeatureType = 'slacklineGroup' | 'isaMemberGroup' | 'communityCountry';
type MapFeatureEntityType = SlacklineMapFeatureType | CommunityMapFeatureType;
type GuideType =
  | 'parkingLot'
  | 'campingSpot'
  | 'accessPath'
  | 'riggingPath'
  | 'information'
  | 'other';
type MapFeatureChangelogAction =
  | 'created'
  | 'updatedDetails'
  | 'updatedOwners'
  | 'grantedTemporaryEditor';
