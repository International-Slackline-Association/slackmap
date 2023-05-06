import { MapFeatureChangelog } from 'core/features/mapFeature/types';

export const getFeatureChangelogsResponse = (items: MapFeatureChangelog[], pagination: { cursor?: any }) => {
  return {
    items,
    pagination,
  };
};
