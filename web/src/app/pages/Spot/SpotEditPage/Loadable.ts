import { lazyLoad } from 'utils/loadable';

export const SpotEditPage = lazyLoad(
  () => import('.'),
  (module) => module.SpotEditPage,
);
