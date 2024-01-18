import { lazyLoad } from 'utils/loadable';

export const CreateSpotPage = lazyLoad(
  () => import('./index'),
  (module) => module.CreateSpotPage,
);
