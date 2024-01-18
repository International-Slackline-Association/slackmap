import { useEffect, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';

const parseLocation = (
  location: Location,
): { id: string; type: CommunityMapFeatureType } | undefined => {
  const pathParts = location.pathname.split('/');
  const type = pathParts[2];
  const id = pathParts[3];
  switch (type) {
    case 'group':
      return {
        id,
        type: 'slacklineGroup',
      };
    case 'country':
      return {
        id: id.toUpperCase(),
        type: 'communityCountry',
      };
    default:
      return undefined;
  }
};

export function useActiveCommunityFeature() {
  const location = useLocation();
  const [activeFeature, setActiveFeature] = useState<
    | {
        id: string;
        type: CommunityMapFeatureType;
      }
    | undefined
  >(parseLocation(location));

  useEffect(() => {
    setActiveFeature(parseLocation(location));
  }, [location]);

  return { activeFeature, setActiveFeature };
}
