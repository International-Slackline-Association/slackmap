import * as crypto from 'crypto';
import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3ImageUploadZodSchema } from '@functions/api/utils';
import { s3 } from 'core/aws/clients';
import { isaToolsApi } from 'core/externalApi/isa-tools-api';
import { z } from 'zod';

export const updateFeatureImagesInS3 = async (
  featureId: string,
  images: z.infer<typeof s3ImageUploadZodSchema>,
  opts: {
    prefix?: string;
    maxImageNumber: number;
  },
) => {
  if (!images) return;

  const prefix = opts.prefix || 'media';

  let s3Images = await getAllFeatureImages(featureId, prefix);

  // Removed deleted images
  for (const { imageId, key } of s3Images) {
    if (!images.find((i) => i.id === imageId)) {
      await deleteFeatureImage(key);
    }
  }

  s3Images = await getAllFeatureImages(featureId, prefix);

  let totalImageCount = s3Images.length;
  const addedImages = images?.filter((i) => i.isInProcessingBucket) ?? [];
  for (const addedImage of addedImages) {
    if (totalImageCount >= opts.maxImageNumber) {
      break;
    }
    await processAndPutFeatureImage(addedImage.s3Key, featureId, prefix, generateImageId());
    totalImageCount++;
  }

  s3Images = await getAllFeatureImages(featureId, prefix);
  const featureImages = s3Images.map((image) => ({
    s3Key: image.key,
    isCover: images?.find((i) => i.id === image.imageId)?.isCover,
    id: image.imageId,
  }));

  return featureImages;
};

export const deleteAllFeatureImages = async (featureId: string) => {
  const images = await getAllFeatureImages(featureId, '');
  for (const image of images) {
    await deleteFeatureImage(image.key);
  }
};

const getAllFeatureImages = async (featureId: string, prefix: string) => {
  const keys = await s3
    .send(
      new ListObjectsV2Command({
        Bucket: process.env.SLACKMAP_IMAGES_S3_BUCKET,
        Prefix: constructS3Key(featureId, prefix),
      }),
    )
    .then((data) => {
      return (data.Contents || [])
        .map((c) => {
          if (c.Key) {
            const imageName = c.Key.split('/').pop()?.split('.');
            if (!imageName) return undefined;
            return { key: c.Key, imageId: imageName[0], type: imageName[1] };
          }
          return undefined;
        })
        .filter((c) => c !== undefined) as { key: string; imageId: string; type: string }[];
    });

  return keys;
};

const processAndPutFeatureImage = async (
  processingBucketKey: string,
  featureId: string,
  prefix: string,
  imageId: string,
) => {
  const result = await isaToolsApi.processImage({
    input: {
      s3: {
        key: processingBucketKey,
      },
    },
    output: {
      s3: {
        bucket: process.env.SLACKMAP_IMAGES_S3_BUCKET,
        key: constructS3Key(featureId, prefix, imageId, 'jpeg'),
      },
    },
    outputFormat: 'jpeg',
    resize: {
      width: 1024,
      height: 1024,
      fit: 'inside',
    },
    quality: 80,
    cacheControl: 'public, max-age=864000',
  });
  return result;
};

const deleteFeatureImage = async (key: string) => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.SLACKMAP_IMAGES_S3_BUCKET,
      Key: key,
    }),
  );
};

const constructS3Key = (featureId: string, prefix: string, imageId?: string, type?: string) => {
  let path = `public/${featureId}/`;
  if (prefix) {
    path += `${prefix}/`;
  }
  if (imageId && type) {
    path += `${imageId}.${type}`;
  }
  return path;
};

const generateImageId = () => {
  return crypto.randomBytes(2).toString('hex'); // 4 characters
};
