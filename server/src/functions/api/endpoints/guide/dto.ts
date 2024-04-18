import { FeatureCollection } from '@turf/turf';
import { DDBGuideDetailTypes } from 'core/db/entities/guide/details/types';
import { guideTypeLabel } from 'core/features/guide';

export const getGuideDetailsResponse = (
  item: DDBGuideDetailTypes['Entity'],
  editorPermissions?: {
    canDelete: boolean;
    canEdit: boolean;
  },
) => {
  return {
    id: item.guideId,
    geoJson: JSON.parse(item.geoJson) as FeatureCollection,
    description: item.description,
    createdDateTime: item.createdDateTime,
    lastModifiedDateTime: item.lastModifiedDateTime,
    type: item.type,
    typeLabel: guideTypeLabel(item.type),
    creatorUserId: item.creatorUserId,
    images: item.images,
    editorPermissions,
  };
};
