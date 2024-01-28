import { useState } from 'react';
import Carousel from 'react-material-ui-carousel';

import LandscapeIcon from '@mui/icons-material/Landscape';
import { Dialog, ImageList, ImageListItem, Paper, Typography } from '@mui/material';

import { imageUrlFromS3Key } from 'utils';

import { FeatureDetailFieldLayout } from './DetailFieldLayout';

interface Props {
  type?: 'anchor-images' | 'media';
  images?: {
    s3Key: string;
  }[];
}
export const FeatureMediaField = (props: Props) => {
  const images = props.images?.filter((i) => i.s3Key).map((i) => imageUrlFromS3Key(i.s3Key)) || [];
  const [carouselIndex, setCarouselIndex] = useState<number>();

  const title = props.type === 'anchor-images' ? 'Anchor Photos' : 'Photos';
  const noDataMessage =
    props.type === 'anchor-images'
      ? 'There are no anchor photos 😔 Anchor photos can be very helpful for others!. Be the first one and upload some images by editing :)'
      : 'There are no photos 😔 Be the first one and upload some images by editing :)';
  return (
    <FeatureDetailFieldLayout icon={<LandscapeIcon />} header={title}>
      <Dialog
        open={carouselIndex !== undefined}
        onClose={() => {
          setCarouselIndex(undefined);
        }}
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: 'unset',
            width: 'unset',
            height: 'unset',
            maxHeight: 'unset',
            p: 1,
            'div > div:nth-child(1)': {
              pointerEvents: { xs: 'none', lg: 'auto' }, // enable pinch zoom on mobile
            },
          },
        }}
      >
        <Carousel
          autoPlay={false}
          animation={'slide'}
          navButtonsAlwaysVisible
          indicators={false}
          index={carouselIndex}
          sx={{
            width: '80vw',
            maxHeight: { xs: '80vh', lg: 'unset' },
            height: { xs: 'unset', lg: '80vh' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {images.map((url, i) => (
            <Paper
              key={i}
              sx={{
                maxHeight: { xs: '80vh', lg: 'unset' },
                height: { xs: 'unset', lg: '80vh' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                src={url}
                alt={''}
                loading="lazy"
              />
            </Paper>
          ))}
        </Carousel>
      </Dialog>
      {images.length === 0 ? (
        <Typography variant="body2" color={(t) => t.palette.text.secondary}>
          {noDataMessage}
        </Typography>
      ) : (
        <ImageList variant="standard" cols={3} gap={8}>
          {images.map((image, index) => (
            <ImageListItem
              key={index}
              onClick={() => {
                setCarouselIndex(index);
              }}
            >
              <img src={image} alt={''} loading="lazy" />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </FeatureDetailFieldLayout>
  );
};
