import { FeatureCollection } from '@turf/turf';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';

export const getSpotDetailsResponse = (item: DDBSpotDetailItem, isUserEditor?: boolean) => {
  return {
    id: item.spotId,
    geoJson: JSON.parse(item.geoJson) as FeatureCollection,
    name: item.name,
    description: item.description,
    createdDateTime: item.createdDateTime,
    lastModifiedDateTime: item.lastModifiedDateTime,
    creatorUserId: item.creatorUserId,
    accessInfo: item.accessInfo,
    contactInfo: item.contactInfo,
    restrictionLevel: item.restrictionLevel,
    extraInfo: item.extraInfo,
    restrictionInfo: item.restrictionInfo,
    images: item.images,
    isUserEditor: isUserEditor,
  };
};
