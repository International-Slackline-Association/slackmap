/**
 *
 * Asynchronously loads the component for LegacyDetailPage
 *
 */
import { lazyLoad } from 'utils/loadable';

export const LegacyDetailPage = lazyLoad(
  () => import('./index'),
  (module) => module.LegacyDetailPage,
);
