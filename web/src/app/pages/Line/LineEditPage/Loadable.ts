import { lazyLoad } from 'utils/loadable';

export const LineEditPage = lazyLoad(
  () => import('.'),
  (module) => module.LineEditPage,
);
