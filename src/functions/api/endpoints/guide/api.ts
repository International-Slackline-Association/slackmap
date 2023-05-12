import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper, validateApiPayload, verifyRequestClaims } from '../../utils';
import * as db from 'core/db';
import { getGuideDetailsResponse } from './dto';
import { FeatureCollection, Geometry } from '@turf/turf';
import { CreateGuidePostBody, createGuideSchema, UpdateGuidePostBody, updateGuideSchema } from './schema';
import { nanoid } from 'nanoid';
import { validateMapFeatureEditor } from 'core/features/mapFeature/editors';
import { processGuideGeoJson } from 'core/features/geojson';
import { assignFromSourceToTarget } from 'core/utils';
import { updateFeatureImagesInS3 } from 'core/features/mapFeature/image';
import { validateGuideGeoJson } from 'core/features/guide/validations';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { GuideType } from 'core/types';
import { logger } from 'core/utils/logger';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import { addCreatedChangelogToFeature } from 'core/features/mapFeature/changelog';

export const getGuideDetails = async (req: Request, res: Response) => {
  const guide = await db.getGuideDetails(req.params.id);
  if (!guide) {
    throw new Error(`NotFound: Guide ${req.params.id} not found`);
  }
  const isUserEditor = Boolean(await validateMapFeatureEditor(guide.guideId, 'guide', req.user?.isaId));
  res.json(getGuideDetailsResponse(guide, isUserEditor));
};
export const createGuide = async (req: Request<any, any, CreateGuidePostBody>, res: Response) => {
  const requestClaims = verifyRequestClaims(req);
  const body = validateApiPayload(req.body, createGuideSchema);
  const geoJson = body.geoJson as unknown as FeatureCollection;

  if (!validateGuideGeoJson(geoJson as FeatureCollection<Geometry>)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const guideId = nanoid(7);

  const processedGeoJson = processGuideGeoJson(geoJson, {
    guideId,
    type: body.type as GuideType,
  });

  const guideImages = await updateFeatureImagesInS3(guideId, body.images);
  const countryCode = await getCountryCodeOfGeoJson(processedGeoJson);

  const guide: DDBGuideDetailItem = {
    guideId,
    geoJson: JSON.stringify(processedGeoJson),
    description: body.description,
    type: body.type,
    creatorUserId: requestClaims.isaId,
    createdDateTime: new Date().toISOString(),
    lastModifiedDateTime: new Date().toISOString(),
    images: guideImages,
    country: countryCode,
  };
  await db.putGuide(guide);
  await addCreatedChangelogToFeature(guide, requestClaims.isaId, new Date());

  logger.info('created guide', { user: req.user, guide });
  res.json(getGuideDetailsResponse(guide));
};

export const updateGuide = async (req: Request<any, any, UpdateGuidePostBody>, res: Response) => {
  verifyRequestClaims(req);

  const guideId = req.params.id;
  const body = validateApiPayload(req.body, updateGuideSchema);
  await validateMapFeatureEditor(guideId, 'guide', req.user?.isaId, true);

  const geoJson = body.geoJson as unknown as FeatureCollection;

  const guide = await db.getGuideDetails(guideId);
  if (!guide) {
    throw new Error('NotFound: Guide not found');
  }

  if (!validateGuideGeoJson(geoJson as FeatureCollection<Geometry>)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const processedGeoJson = processGuideGeoJson(geoJson, {
    guideId,
    type: body.type as GuideType,
  });

  const guideImages = await updateFeatureImagesInS3(guideId, body.images);

  const payload = { ...req.body, images: guideImages, geoJson: JSON.stringify(processedGeoJson) };
  const updatedGuide = assignFromSourceToTarget(payload, guide);
  updatedGuide.lastModifiedDateTime = new Date().toISOString();
  await db.putGuide(updatedGuide);

  logger.info('updated guide', { user: req.user, updatedGuide });
  res.json(getGuideDetailsResponse(updatedGuide));
};

export const deleteGuide = async (req: Request, res: Response) => {
  const guideId = req.params.id;
  await validateMapFeatureEditor(guideId, 'guide', req.user?.isaId, true);
  await db.deleteGuide(guideId);

  logger.info('deleted guide', { user: req.user, guideId });
  res.json({});
};

export const guideApi = express.Router();
guideApi.post('/', catchExpressJsErrorWrapper(createGuide));
guideApi.get('/:id/details', catchExpressJsErrorWrapper(getGuideDetails));
guideApi.put('/:id', catchExpressJsErrorWrapper(updateGuide));
guideApi.delete('/:id', catchExpressJsErrorWrapper(deleteGuide));
