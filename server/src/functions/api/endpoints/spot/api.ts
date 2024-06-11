import { db } from 'core/db';
import { DDBSpotDetailTypes } from 'core/db/entities/spot/details/types';
import { processSpotGeoJson } from 'core/features/geojson';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import {
  addCreatedChangelogToFeature,
  addUpdatedDetailsChangelog,
} from 'core/features/mapFeature/changelog';
import { validateMapFeatureEditor } from 'core/features/mapFeature/editors';
import { updateFeatureImagesInS3 } from 'core/features/mapFeature/image';
import { validateSpotGeoJson } from 'core/features/spot/validations';
import { assignFromSourceToTarget } from 'core/utils';
import { logger } from 'core/utils/logger';
import express, { Request } from 'express';
import { FeatureCollection } from 'geojson';
import { nanoid } from 'nanoid';

import { expressRoute, validateApiPayload, verifyRequestClaims } from '../../utils';
import { getSpotDetailsResponse } from './dto';
import {
  CreateSpotPostBody,
  UpdateSpotPostBody,
  createSpotSchema,
  updateSpotSchema,
} from './schema';

export const getSpotDetails = async (req: Request) => {
  const spot = await db.getSpotDetails(req.params.id);
  if (!spot) {
    throw new Error('NotFound: Spot not found');
  }
  const editPermission = await validateMapFeatureEditor(spot.spotId, 'spot', req.user?.isaId);

  return getSpotDetailsResponse(spot, {
    canDelete: editPermission?.reason === 'explicit',
    canEdit: Boolean(editPermission),
  });
};

export const createSpot = async (req: Request<any, any, CreateSpotPostBody>) => {
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

  const spot: DDBSpotDetailTypes['Entity'] = {
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
  return getSpotDetailsResponse(spot);
};

export const updateSpot = async (req: Request<any, any, UpdateSpotPostBody>) => {
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
  return getSpotDetailsResponse(updatedSpot);
};

export const spotApi = express.Router();
spotApi.post('/', expressRoute(createSpot));
spotApi.get('/:id/details', expressRoute(getSpotDetails));
spotApi.put('/:id', expressRoute(updateSpot));
