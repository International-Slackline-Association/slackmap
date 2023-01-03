import { DDBLineDetailItem } from 'core/db/line/details/types';

export const getLineDetailsResponse = (item: DDBLineDetailItem) => {
  return {
    id: item.lineId,
    name: item.name,
    description: item.description,
    geoJson: item.geoJson,
    createdDateTime: item.createdDateTime,
    lastModifiedDateTime: item.lastModifiedDateTime,
    type: item.type,
    creatorUserId: item.creatorUserId,
    city: item.city,
    length: item.length,
    height: item.height,
    accessInfo: item.accessInfo,
    anchorsInfo: item.anchorsInfo,
    gearInfo: item.gearInfo,
    contactInfo: item.contactInfo,
    restrictionLevel: item.restrictionLevel,
    extraInfo: item.extraInfo,
    coverImageUrl: item.coverImageUrl,
    restrictionInfo: item.restrictionInfo,
  };
};
