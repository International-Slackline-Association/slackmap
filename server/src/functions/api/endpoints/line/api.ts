import * as turf from '@turf/turf';
import * as db from 'core/db';
import { FeatureCollection } from '@turf/turf';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { processLineGeoJson } from 'core/features/geojson';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import { validateLineGeoJson } from 'core/features/line/validations';
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
import { assignFromSourceToTarget } from 'core/utils';
import { logger } from 'core/utils/logger';
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';

import { catchExpressJsErrorWrapper, validateApiPayload, verifyRequestClaims } from '../../utils';
import { getLineDetailsResponse } from './dto';
import {
  CreateLinePostBody,
  UpdateLinePostBody,
  createLineSchema,
  updateLineSchema,
} from './schema';

export const getLineDetails = async (req: Request, res: Response) => {
  const line = await db.getLineDetails(req.params.id);
  if (!line) {
    throw new Error(`NotFound: Line ${req.params.id} not found`);
  }
  const isUserEditor = Boolean(
    await validateMapFeatureEditor(line.lineId, 'line', req.user?.isaId),
  );

  res.json(getLineDetailsResponse(line, isUserEditor));
};

export const createLine = async (req: Request<any, any, CreateLinePostBody>, res: Response) => {
  const requestClaims = verifyRequestClaims(req);
  const body = validateApiPayload(req.body, createLineSchema);
  const geoJson = body.geoJson as unknown as FeatureCollection;

  if (!validateLineGeoJson(geoJson, body.length)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const lineId = nanoid(7);
  const length = parseFloat(
    (body.length || turf.length(geoJson.features[0], { units: 'meters' })).toFixed(2),
  );
  const countryCode = await getCountryCodeOfGeoJson(geoJson);

  const processedGeoJson = processLineGeoJson(geoJson, {
    lineId: lineId,
    type: body.type,
    length: length,
    country: countryCode,
  });

  const anchorImages = await updateFeatureImagesInS3(lineId, body.anchorImages, {
    prefix: 'anchors',
    maxImageNumber: 5,
  });
  const lineImages = await updateFeatureImagesInS3(lineId, body.images, {
    maxImageNumber: 3,
  });

  const isMeasured = body.length ? body.isMeasured : false;
  const line: DDBLineDetailItem = {
    lineId,
    geoJson: JSON.stringify(processedGeoJson),
    name: body.name,
    description: body.description,
    type: body.type,
    country: countryCode,
    accessInfo: body.accessInfo,
    anchorsInfo: body.anchorsInfo,
    gearInfo: body.gearInfo,
    contactInfo: body.contactInfo,
    restrictionLevel: body.restrictionLevel,
    restrictionInfo: body.restrictionInfo,
    extraInfo: body.extraInfo,
    isMeasured: isMeasured,
    creatorUserId: requestClaims.isaId,
    createdDateTime: new Date().toISOString(),
    lastModifiedDateTime: new Date().toISOString(),
    length: length,
    height: body.height,
    anchorImages: anchorImages,
    images: lineImages,
  };
  await db.putLine(line);
  await addCreatedChangelogToFeature(line, requestClaims.isaId, new Date());

  logger.info('created line', { user: req.user, line });
  res.json(getLineDetailsResponse(line));
};

export const updateLine = async (req: Request<any, any, UpdateLinePostBody>, res: Response) => {
  const requestClaims = verifyRequestClaims(req);

  const lineId = req.params.id;
  const body = validateApiPayload(req.body, updateLineSchema);
  await validateMapFeatureEditor(lineId, 'line', req.user?.isaId, { shouldThrow: true });

  const geoJson = body.geoJson as unknown as FeatureCollection;

  const line = await db.getLineDetails(lineId);
  if (!line) {
    throw new Error('NotFound: Line not found');
  }

  if (!validateLineGeoJson(geoJson, body.length)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const length = parseFloat(
    (body.length || turf.length(geoJson.features[0], { units: 'meters' })).toFixed(2),
  );

  const processedGeoJson = processLineGeoJson(geoJson, {
    lineId: lineId,
    type: body.type,
    length: length,
    country: line.country,
  });

  const anchorImages = await updateFeatureImagesInS3(lineId, body.anchorImages, {
    prefix: 'anchors',
    maxImageNumber: 5,
  });
  const lineImages = await updateFeatureImagesInS3(lineId, body.images, {
    maxImageNumber: 3,
  });

  const payload = {
    ...req.body,
    anchorImages,
    images: lineImages,
    length,
    geoJson: JSON.stringify(processedGeoJson),
  };
  const updatedLine = assignFromSourceToTarget(payload, line);
  updatedLine.lastModifiedDateTime = new Date().toISOString();
  await db.putLine(updatedLine);
  await addUpdatedDetailsChangelog(updatedLine, line, requestClaims.isaId, new Date());

  logger.info('updated line', { user: req.user, updatedLine });
  res.json(getLineDetailsResponse(updatedLine));
};

export const deleteLine = async (req: Request, res: Response) => {
  const lineId = req.params.id;
  const editor = await validateMapFeatureEditor(lineId, 'line', req.user?.isaId, {
    shouldThrow: true,
  });
  if (editor?.reason === 'temporary') {
    throw new Error('Forbidden: Temporary editor cannot delete lines');
  }
  await db.deleteLine(lineId);

  logger.info('deleted line', { user: req.user, lineId });
  res.json({});
};

export const requestTemporaryEditorship = async (req: Request, res: Response) => {
  const requestClaims = verifyRequestClaims(req);
  const lineId = req.params.id;

  const line = await db.getLineDetails(lineId, { fields: [] });
  if (!line) {
    throw new Error('NotFound: Line not found');
  }

  await addTemporaryEditorToMapFeature(lineId, 'line', requestClaims.isaId);
  await addTemporaryEditorChangelogToFeature(
    lineId,
    'line',
    requestClaims.isaId,
    new Date(),
    line.country,
  );

  logger.info('added temporary editor for line', { user: req.user, lineId });
  res.json({});
};

export const lineApi = express.Router();
lineApi.post('/', catchExpressJsErrorWrapper(createLine));
lineApi.get('/:id/details', catchExpressJsErrorWrapper(getLineDetails));
lineApi.put('/:id', catchExpressJsErrorWrapper(updateLine));
lineApi.delete('/:id', catchExpressJsErrorWrapper(deleteLine));
lineApi.put(
  '/:id/requestTemporaryEditorship',
  catchExpressJsErrorWrapper(requestTemporaryEditorship),
);
