/**
 *
 * Asynchronously loads the component for LegacyDetailPage
 *
 */
import { lazyLoad } from 'utils/loadable';

export const SlacklineMapPage = lazyLoad(
  () => import('./index'),
  (module) => module.SlacklineMapPage,
);
