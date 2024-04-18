import * as turf from '@turf/turf';
import { FeatureCollection } from '@turf/turf';
import { db } from 'core/db';
import { DDBLineDetailTypes } from 'core/db/entities/line/details/types';
import { processLineGeoJson } from 'core/features/geojson';
import { getCountryCodeOfGeoJson } from 'core/features/geojson/utils';
import { validateLineGeoJson } from 'core/features/line/validations';
import {
  addCreatedChangelogToFeature,
  addUpdatedDetailsChangelog,
} from 'core/features/mapFeature/changelog';
import { validateMapFeatureEditor } from 'core/features/mapFeature/editors';
import { updateFeatureImagesInS3 } from 'core/features/mapFeature/image';
import { assignFromSourceToTarget } from 'core/utils';
import { logger } from 'core/utils/logger';
import express, { Request } from 'express';
import { nanoid } from 'nanoid';

import { expressRoute, validateApiPayload, verifyRequestClaims } from '../../utils';
import { getLineDetailsResponse } from './dto';
import {
  CreateLinePostBody,
  UpdateLinePostBody,
  createLineSchema,
  updateLineSchema,
} from './schema';

export const getLineDetails = async (req: Request) => {
  const line = await db.getLineDetails(req.params.id);
  if (!line) {
    throw new Error(`NotFound: Line ${req.params.id} not found`);
  }
  const editPermission = await validateMapFeatureEditor(line.lineId, 'line', req.user?.isaId);

  return getLineDetailsResponse(line, {
    canDelete: editPermission?.reason === 'explicit',
    canEdit: Boolean(editPermission),
  });
};

export const createLine = async (req: Request<any, any, CreateLinePostBody>) => {
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
  const line: DDBLineDetailTypes['Entity'] = {
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
  return getLineDetailsResponse(line);
};

export const updateLine = async (req: Request<any, any, UpdateLinePostBody>) => {
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
  return getLineDetailsResponse(updatedLine);
};

export const lineApi = express.Router();
lineApi.post('/', expressRoute(createLine));
lineApi.get('/:id/details', expressRoute(getLineDetails));
lineApi.put('/:id', expressRoute(updateLine));
