import { lazyLoad } from 'utils/loadable';

export const CreateLinePage = lazyLoad(
  () => import('./index'),
  (module) => module.CreateLinePage,
);
