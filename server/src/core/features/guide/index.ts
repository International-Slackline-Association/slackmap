import { GuideType } from 'core/types';

export const guideTypeLabel = (type: GuideType) => {
  switch (type) {
    case 'parkingLot':
      return 'Parking Lot';
    case 'campingSpot':
      return 'Camping Spot';
    case 'accessPath':
      return 'Access Path';
    case 'riggingPath':
      return 'Rigging Path';
    case 'information':
      return 'Information';
    case 'other':
      return 'Other';
    default:
      return 'Other';
  }
};
