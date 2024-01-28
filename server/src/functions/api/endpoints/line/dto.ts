import { FeatureCollection } from '@turf/turf';
import { DDBLineDetailItem } from 'core/db/line/details/types';

export const getLineDetailsResponse = (
  item: DDBLineDetailItem,
  editorPermissions?: {
    canDelete: boolean;
    canEdit: boolean;
  },
) => {
  return {
    id: item.lineId,
    geoJson: JSON.parse(item.geoJson) as FeatureCollection,
    name: item.name,
    description: item.description,
    createdDateTime: item.createdDateTime,
    lastModifiedDateTime: item.lastModifiedDateTime,
    type: item.type,
    creatorUserId: item.creatorUserId,
    length: item.length,
    height: item.height,
    accessInfo: item.accessInfo,
    anchorsInfo: item.anchorsInfo,
    gearInfo: item.gearInfo,
    contactInfo: item.contactInfo,
    restrictionLevel: item.restrictionLevel,
    extraInfo: item.extraInfo,
    restrictionInfo: item.restrictionInfo,
    isMeasured: item.isMeasured,
    anchorImages: item.anchorImages,
    images: item.images,
    editorPermissions,
  };
};
