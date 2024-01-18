export interface MapFeatureEntity<T extends MapFeatureEntityType = MapFeatureEntityType> {
  id: string;
  type: T;
}

export interface MapFeatureCommonProperties {
  id: string;
  ft: 'l' | 's' | 'g' | 'ct' | 'sg' | 'isaM' | 'comCt'; // feature type
  c?: string; // country
}
