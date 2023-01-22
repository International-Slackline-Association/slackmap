import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { guideTypeLabel } from 'core/features/guide';

export const getGuideDetailsResponse = (item: DDBGuideDetailItem, isUserEditor?: boolean) => {
  return {
    id: item.guideId,
    description: item.description,
    createdDateTime: item.createdDateTime,
    lastModifiedDateTime: item.lastModifiedDateTime,
    type: item.type,
    typeLabel: guideTypeLabel(item.type),
    creatorUserId: item.creatorUserId,
    isUserEditor: isUserEditor,
    images: item.images,
  };
};
