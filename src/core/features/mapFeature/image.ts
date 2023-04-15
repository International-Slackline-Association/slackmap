import { s3 } from 'core/aws/clients';

export const updateFeatureImagesInS3 = async (
  featureId: string,
  images?: { id?: string; content?: string; isCover?: boolean }[],
) => {
  let s3Images = await getAllFeatureImages(featureId);
  const existingImages = images?.filter((i) => i.id) ?? [];
  const addedImages = images?.filter((i) => i.content) ?? [];

  for (const { imageId, type } of s3Images) {
    if (!existingImages.find((i) => i.id === imageId)) {
      await deleteFeatureImage({ featureId: featureId, imageId, type }); // Removed deleted images
    }
  }

  s3Images = await getAllFeatureImages(featureId);
  let nextImageId = s3Images.reduce((max, image) => Math.max(max, parseInt(image.imageId)), 0) + 1;
  for (const addedImage of addedImages) {
    if (s3Images.length >= 3) {
      throw new Error('Validation: Maximum 3 images are allowed per line');
    }
    if (addedImage.content) {
      const base64Data = Buffer.from(addedImage.content.replace(/^.+?(;base64),/, ''), 'base64');
      let type = 'unknown';
      switch (addedImage.content.charAt(0)) {
        case '/':
          type = 'jpg';
          break;
        case 'i':
          type = 'png';
          break;
        default: // I think trying jpg is the best option here
          type = 'jpg';
          break;
      }
      await putFeatureImage(featureId, nextImageId.toString(), base64Data, type);
    }
    nextImageId++;
  }

  s3Images = await getAllFeatureImages(featureId);
  const featureImages = s3Images.map((image) => ({
    s3Key: image.key,
    isCover: images?.find((i) => i.id === image.imageId)?.isCover,
    id: image.imageId,
  }));

  return featureImages;
};

export const deleteAllFeatureImages = async (featureId: string) => {
  const images = await getAllFeatureImages(featureId);
  for (const image of images) {
    await deleteFeatureImage({ key: image.key });
  }
};

const getS3KeyForFeatureImage = (featureId: string, imageId: string, type: string) => {
  return `public/${featureId}/media/${imageId}.${type}`;
};

const getAllFeatureImages = async (featureId: string) => {
  const keys = await s3
    .listObjectsV2({
      Bucket: process.env.SLACKMAP_IMAGES_S3_BUCKET,
      Prefix: `public/${featureId}/`,
    })
    .promise()
    .then((data) => {
      return (data.Contents || [])
        .map((c) => {
          if (c.Key) {
            return { key: c.Key, imageId: c.Key.split('/').pop()?.split('.').shift(), type: c.Key.split('.').pop() };
          }
          return undefined;
        })
        .filter((c) => c !== undefined) as { key: string; imageId: string; type: string }[];
    });

  return keys;
};

const putFeatureImage = async (featureId: string, imageId: string, body: Buffer, type: string) => {
  await s3
    .putObject({
      Bucket: process.env.SLACKMAP_IMAGES_S3_BUCKET,
      Key: getS3KeyForFeatureImage(featureId, imageId, type),
      Body: body,
      ContentType: 'image/' + type,
      CacheControl: 'public, max-age=864000',
    })
    .promise();
};

const deleteFeatureImage = async (opts: { key?: string; featureId?: string; imageId?: string; type?: string }) => {
  await s3
    .deleteObject({
      Bucket: process.env.SLACKMAP_IMAGES_S3_BUCKET,
      Key: opts.key || getS3KeyForFeatureImage(opts.featureId || '', opts.imageId || '', opts.type || ''),
    })
    .promise();
};
