import { lazyLoad } from 'utils/loadable';

export const CreateGuidePage = lazyLoad(
  () => import('./index'),
  (module) => module.CreateGuidePage,
);
