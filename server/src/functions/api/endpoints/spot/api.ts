import * as db from 'core/db';
import { FeatureCollection } from '@turf/turf';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { processSpotGeoJson } from 'core/features/geojson';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import {
  addCreatedChangelogToFeature,
  addTemporaryEditorChangelogToFeature,
  addUpdatedDetailsChangelog,
} from 'core/features/mapFeature/changelog';
import {
  addTemporaryEditorToMapFeature,
  validateMapFeatureEditor,
} from 'core/features/mapFeature/editors';
import { updateFeatureImagesInS3 } from 'core/features/mapFeature/image';
import { validateSpotGeoJson } from 'core/features/spot/validations';
import { assignFromSourceToTarget } from 'core/utils';
import { logger } from 'core/utils/logger';
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';

import { catchExpressJsErrorWrapper, validateApiPayload, verifyRequestClaims } from '../../utils';
import { getSpotDetailsResponse } from './dto';
import {
  CreateSpotPostBody,
  UpdateSpotPostBody,
  createSpotSchema,
  updateSpotSchema,
} from './schema';

export const getSpotDetails = async (req: Request, res: Response) => {
  const spot = await db.getSpotDetails(req.params.id);
  if (!spot) {
    throw new Error('NotFound: Spot not found');
  }
  const isUserEditor = Boolean(
    await validateMapFeatureEditor(spot.spotId, 'spot', req.user?.isaId),
  );

  res.json(getSpotDetailsResponse(spot, isUserEditor));
};

export const createSpot = async (req: Request<any, any, CreateSpotPostBody>, res: Response) => {
  const requestClaims = verifyRequestClaims(req);
  const body = validateApiPayload(req.body, createSpotSchema);
  const geoJson = body.geoJson as unknown as FeatureCollection;

  if (!validateSpotGeoJson(geoJson)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const spotId = nanoid(7);
  const countryCode = await getCountryCodeOfGeoJson(geoJson);

  const processedGeoJson = processSpotGeoJson(geoJson, {
    spotId: spotId,
    country: countryCode,
  });

  const spotImages = await updateFeatureImagesInS3(spotId, body.images, {
    maxImageNumber: 3,
  });

  const spot: DDBSpotDetailItem = {
    spotId,
    geoJson: JSON.stringify(processedGeoJson),
    name: body.name,
    description: body.description,
    accessInfo: body.accessInfo,
    contactInfo: body.contactInfo,
    restrictionLevel: body.restrictionLevel,
    restrictionInfo: body.restrictionInfo,
    extraInfo: body.extraInfo,
    creatorUserId: requestClaims.isaId,
    createdDateTime: new Date().toISOString(),
    lastModifiedDateTime: new Date().toISOString(),
    images: spotImages,
    country: countryCode,
  };
  await db.putSpot(spot);
  await addCreatedChangelogToFeature(spot, requestClaims.isaId, new Date());

  logger.info('created spot', { user: req.user, spot });
  res.json(getSpotDetailsResponse(spot));
};

export const updateSpot = async (req: Request<any, any, UpdateSpotPostBody>, res: Response) => {
  const requestClaims = verifyRequestClaims(req);

  const spotId = req.params.id;
  const body = validateApiPayload(req.body, updateSpotSchema);
  await validateMapFeatureEditor(spotId, 'spot', req.user?.isaId, { shouldThrow: true });

  const geoJson = body.geoJson as unknown as FeatureCollection;

  const spot = await db.getSpotDetails(spotId);
  if (!spot) {
    throw new Error('NotFound: Spot not found');
  }

  if (!validateSpotGeoJson(geoJson)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const spotImages = await updateFeatureImagesInS3(spotId, body.images, {
    maxImageNumber: 3,
  });

  const processedGeoJson = processSpotGeoJson(geoJson, { spotId, country: spot.country });
  const payload = { ...req.body, images: spotImages, geoJson: JSON.stringify(processedGeoJson) };
  const updatedSpot = assignFromSourceToTarget(payload, spot);
  updatedSpot.lastModifiedDateTime = new Date().toISOString();
  await db.putSpot(updatedSpot);
  await addUpdatedDetailsChangelog(updatedSpot, spot, requestClaims.isaId, new Date());

  logger.info('updated spot', { user: req.user, updatedSpot });
  res.json(getSpotDetailsResponse(updatedSpot));
};

export const deleteSpot = async (req: Request, res: Response) => {
  const spotId = req.params.id;
  const editor = await validateMapFeatureEditor(spotId, 'spot', req.user?.isaId, {
    shouldThrow: true,
  });
  if (editor?.reason === 'temporary') {
    throw new Error('Forbidden: Temporary editor cannot delete spots');
  }
  await db.deleteSpot(spotId);
  logger.info('deleted spot', { user: req.user, spotId });
  res.json({});
};

export const requestTemporaryEditorship = async (req: Request, res: Response) => {
  const requestClaims = verifyRequestClaims(req);
  const spotId = req.params.id;
  const spot = await db.getSpotDetails(spotId, { fields: [] });
  if (!spot) {
    throw new Error('NotFound: Spot not found');
  }
  await addTemporaryEditorToMapFeature(spotId, 'spot', requestClaims.isaId);
  await addTemporaryEditorChangelogToFeature(
    spotId,
    'spot',
    requestClaims.isaId,
    new Date(),
    spot.country,
  );

  logger.info('added temporary editor for spot', { user: req.user, spotId });
  res.json({});
};

export const spotApi = express.Router();
spotApi.post('/', catchExpressJsErrorWrapper(createSpot));
spotApi.get('/:id/details', catchExpressJsErrorWrapper(getSpotDetails));
spotApi.put('/:id', catchExpressJsErrorWrapper(updateSpot));
spotApi.delete('/:id', catchExpressJsErrorWrapper(deleteSpot));
spotApi.put(
  '/:id/requestTemporaryEditorship',
  catchExpressJsErrorWrapper(requestTemporaryEditorship),
);
