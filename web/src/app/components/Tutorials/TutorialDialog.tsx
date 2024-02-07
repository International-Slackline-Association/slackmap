import { useState } from 'react';
import Carousel from 'react-material-ui-carousel';

import { Button, Dialog, DialogActions, Slide, SlideProps } from '@mui/material';

import { useCarouselIndex } from 'utils/hooks/useCarouselIndex';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface Props {
  pages: JSX.Element[];
  onClose: () => void;
  closeText?: string;
}

export const TutorialDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(props.pages.length > 0);
  const { carouselIndex, setCarouselIndex, isOnLastIndex } = useCarouselIndex(props.pages.length);

  const close = () => {
    setIsOpen(false);
    props.onClose();
  };

  return (
    <Dialog open={isOpen} onClose={close} TransitionComponent={SlideTransition} sx={{}}>
      <Carousel
        autoPlay={false}
        animation={'slide'}
        navButtonsAlwaysVisible
        indicators={true}
        cycleNavigation={false}
        swipe={false}
        index={carouselIndex}
        onChange={(index) => setCarouselIndex(index as number)}
        sx={{
          width: { xs: '80vw', lg: '25vw' },
          position: 'relative',
        }}
      >
        {...props.pages}
      </Carousel>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button onClick={close}>Skip Tutorial</Button>
        <Button
          onClick={() => {
            isOnLastIndex ? close() : setCarouselIndex(carouselIndex + 1);
          }}
        >
          {isOnLastIndex ? props.closeText || 'Done' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
