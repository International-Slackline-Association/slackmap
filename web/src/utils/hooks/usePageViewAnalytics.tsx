import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { recordAnalyticsPageView } from 'utils/analytics';

export const usePageViewAnalytics = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let id: string | undefined;

    if (path.includes('/create')) {
      id = '/create';
    } else if (path.includes('/line')) {
      id = '/line';
    } else if (path.includes('/spot')) {
      id = '/spot';
    } else if (path.includes('/guide')) {
      id = '/guide';
    }
    if (path.includes('/x/')) {
      id = '/legacy';
    }
    if (path.includes('/country')) {
      id = '/country';
    }
    if (path.includes('/communities')) {
      id = '/communities';
    }

    if (id) {
      recordAnalyticsPageView(id);
    }
  }, [location]);
};
