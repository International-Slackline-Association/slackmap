import { lazyLoad } from 'utils/loadable';

export const GuideEditPage = lazyLoad(
  () => import('.'),
  (module) => module.GuideEditPage,
);
