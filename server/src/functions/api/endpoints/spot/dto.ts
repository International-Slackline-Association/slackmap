import { DDBSpotDetailTypes } from 'core/db/entities/spot/details/types';
import { FeatureCollection } from 'geojson';

export const getSpotDetailsResponse = (
  item: DDBSpotDetailTypes['Entity'],
  editorPermissions?: {
    canDelete: boolean;
    canEdit: boolean;
  },
) => {
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
    editorPermissions,
  };
};
