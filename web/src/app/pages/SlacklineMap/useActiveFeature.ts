import { useEffect, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';

const parseLocation = (
  location: Location,
): { id: string; type: SlacklineMapFeatureType } | undefined => {
  const pathParts = location.pathname.split('/');
  const type = pathParts[1];
  const id = pathParts[2];
  switch (type) {
    case 'line':
      return {
        id,
        type: 'line',
      };
    case 'spot':
      return {
        id,
        type: 'spot',
      };
    case 'guide':
      return {
        id,
        type: 'guide',
      };
    case 'country':
      return {
        id: id.toUpperCase(),
        type: 'country',
      };
    default:
      return undefined;
  }
};

export function useActiveSlacklineFeature() {
  const location = useLocation();
  const [activeFeature, setActiveFeature] = useState<
    | {
        id: string;
        type: SlacklineMapFeatureType;
      }
    | undefined
  >(parseLocation(location));

  useEffect(() => {
    setActiveFeature(parseLocation(location));
  }, [location]);

  return { activeFeature, setActiveFeature };
}
