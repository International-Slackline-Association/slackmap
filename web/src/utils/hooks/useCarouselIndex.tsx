import { useCallback, useEffect, useState } from 'react';

export const useCarouselIndex = (carouselLength?: number) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const changeChild = useCallback(
    (e: KeyboardEvent) => {
      if (!carouselLength) return;
      if (e.key === 'ArrowLeft') {
        setCarouselIndex(Math.max(carouselIndex - 1, 0));
      } else if (e.key === 'ArrowRight') {
        setCarouselIndex(Math.min(carouselIndex + 1, carouselLength - 1));
      }
    },
    [carouselIndex],
  );

  useEffect(() => {
    document.addEventListener('keydown', changeChild);

    return function cleanup() {
      document.removeEventListener('keydown', changeChild);
    };
  });
  const isOnLastIndex = carouselLength ? carouselIndex === carouselLength - 1 : undefined;
  return { carouselIndex, setCarouselIndex, isOnLastIndex };
};
