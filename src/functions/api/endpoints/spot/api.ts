import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper, validateApiPayload, verifyRequestClaims } from '../../utils';
import * as db from 'core/db';
import { getSpotDetailsResponse } from './dto';
import { FeatureCollection } from '@turf/turf';
import { CreateSpotPostBody, createSpotSchema, UpdateSpotPostBody, updateSpotSchema } from './schema';
import { processLineGeoJson, processSpotGeoJson } from 'core/features/geojson';
import { validateMapFeatureEditor } from 'core/features/mapFeature';
import { assignFromSourceToTarget } from 'core/utils';
import { nanoid } from 'nanoid';
import { validateSpotGeoJson } from 'core/features/spot/validations';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { logger } from 'core/utils/logger';

export const getSpotDetails = async (req: Request, res: Response) => {
  const spot = await db.getSpotDetails(req.params.id);
  if (!spot) {
    throw new Error('NotFound: Spot not found');
  }
  const isUserEditor = await validateMapFeatureEditor(spot.spotId, req.claims?.sub);
  res.json(getSpotDetailsResponse(spot, isUserEditor));
};

export const getSpotGeoJson = async (req: Request, res: Response) => {
  const spot = await db.getSpotDetails(req.params.id, { fields: ['geoJson'] });
  if (!spot || !spot.geoJson) {
    throw new Error('NotFound: Spot not found');
  }
  const geoJson = JSON.parse(spot.geoJson) as FeatureCollection;
  res.json(geoJson);
};

export const createSpot = async (req: Request<any, any, CreateSpotPostBody>, res: Response) => {
  const requestClaims = verifyRequestClaims(req);
  const body = validateApiPayload(req.body, createSpotSchema);
  const geoJson = body.geoJson as unknown as FeatureCollection;

  if (!validateSpotGeoJson(geoJson)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const spotId = nanoid(7);

  const processedGeoJson = processSpotGeoJson(geoJson, {
    spotId: spotId,
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
    creatorUserId: requestClaims.sub,
    createdDateTime: new Date().toISOString(),
    lastModifiedDateTime: new Date().toISOString(),
  };
  await db.putSpot(spot);
  res.json(getSpotDetailsResponse(spot));
};

export const updateSpot = async (req: Request<any, any, UpdateSpotPostBody>, res: Response) => {
  verifyRequestClaims(req);

  const spotId = req.params.id;
  const body = validateApiPayload(req.body, updateSpotSchema);
  await validateMapFeatureEditor(spotId, req.claims?.sub, true);

  const geoJson = body.geoJson as unknown as FeatureCollection;

  const spot = await db.getSpotDetails(spotId);
  if (!spot) {
    throw new Error('NotFound: Spot not found');
  }

  if (!validateSpotGeoJson(geoJson)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const processedGeoJson = processSpotGeoJson(geoJson, { spotId });
  const payload = { ...req.body, geoJson: JSON.stringify(processedGeoJson) };
  const updatedSpot = assignFromSourceToTarget(payload, spot);
  updatedSpot.lastModifiedDateTime = new Date().toISOString();
  await db.putSpot(updatedSpot);
  res.json(getSpotDetailsResponse(updatedSpot));
};

export const deleteSpot = async (req: Request, res: Response) => {
  const spotId = req.params.id;
  await validateMapFeatureEditor(spotId, req.claims?.sub, true);
  await db.deleteSpot(spotId);
  res.json({});
};

export const spotApi = express.Router();
spotApi.post('/', catchExpressJsErrorWrapper(createSpot));
spotApi.get('/:id/details', catchExpressJsErrorWrapper(getSpotDetails));
spotApi.get('/:id/geojson', catchExpressJsErrorWrapper(getSpotGeoJson));
spotApi.put('/:id', catchExpressJsErrorWrapper(updateSpot));
spotApi.delete('/:id', catchExpressJsErrorWrapper(deleteSpot));
