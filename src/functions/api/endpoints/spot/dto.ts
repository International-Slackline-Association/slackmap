import { DDBSpotDetailItem } from 'core/db/spot/details/types';

export const getSpotDetailsResponse = (item: DDBSpotDetailItem, isUserEditor?: boolean, hasNoEditors?: boolean) => {
  return {
    id: item.spotId,
    name: item.name,
    description: item.description,
    createdDateTime: item.createdDateTime,
    lastModifiedDateTime: item.lastModifiedDateTime,
    creatorUserId: item.creatorUserId,
    accessInfo: item.accessInfo,
    contactInfo: item.contactInfo,
    restrictionLevel: item.restrictionLevel,
    extraInfo: item.extraInfo,
    coverImageUrl: item.coverImageUrl,
    restrictionInfo: item.restrictionInfo,
    images: item.images,
    isUserEditor: isUserEditor,
    hasNoEditors: hasNoEditors,
  };
};
