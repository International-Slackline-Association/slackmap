// Commonly used types

export type SlacklineType =
  | 'highline'
  | 'waterline'
  | 'midline'
  | 'longline'
  | 'trickline'
  | 'rodeoline'
  | 'parkline'
  | 'other';
export type SlacklineRestrictionLevel = 'partial' | 'full' | 'none';
export type UserIdentityType = 'individual' | 'organization';
export type GuideType =
  | 'parkingLot'
  | 'campingSpot'
  | 'accessPath'
  | 'riggingPath'
  | 'information'
  | 'other';
export type MapFeatureType = 'spot' | 'guide' | 'line';
