/**
 *
 * Asynchronously loads the component for Homepage
 *
 */
import { lazyLoad } from 'utils/loadable';

export const CommunitiesPage = lazyLoad(
  () => import('./index'),
  (module) => module.CommunitiesPage,
);
