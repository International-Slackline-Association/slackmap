import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper, validateApiPayload, verifyRequestClaims } from '../../utils';
import * as db from 'core/db';
import { getLineDetailsResponse } from './dto';
import { FeatureCollection, LineString } from '@turf/turf';
import { CreateLinePostBody, createLineSchema, UpdateLinePostBody, updateLineSchema } from './schema';
import { validateLineGeoJson } from 'core/features/line/validations';
import { nanoid } from 'nanoid';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import * as turf from '@turf/turf';
import { validateMapFeatureEditor } from 'core/features/mapFeature';
import { processLineGeoJson } from 'core/features/geojson';
import { assignFromSourceToTarget } from 'core/utils';
import { updateFeatureImagesInS3 } from 'core/features/mapFeature/image';

export const getLineDetails = async (req: Request, res: Response) => {
  const line = await db.getLineDetails(req.params.id);
  if (!line) {
    throw new Error(`NotFound: Line ${req.params.id} not found`);
  }
  const isUserEditor = await validateMapFeatureEditor(line.lineId, req.user?.isaId);
  res.json(getLineDetailsResponse(line, isUserEditor));
};

export const getLineGeoJson = async (req: Request, res: Response) => {
  const line = await db.getLineDetails(req.params.id, { fields: ['geoJson'] });
  if (!line || !line.geoJson) {
    throw new Error(`NotFound: Line ${req.params.id} not found`);
  }
  const lineGeoJson = JSON.parse(line.geoJson) as FeatureCollection;
  res.json(lineGeoJson);
};

export const createLine = async (req: Request<any, any, CreateLinePostBody>, res: Response) => {
  const requestClaims = verifyRequestClaims(req);
  const body = validateApiPayload(req.body, createLineSchema);
  const geoJson = body.geoJson as unknown as FeatureCollection;

  if (!validateLineGeoJson(geoJson, body.length)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const lineId = nanoid(7);
  const length = parseFloat((body.length || turf.length(geoJson.features[0], { units: 'meters' })).toFixed(2));

  const processedGeoJson = processLineGeoJson(geoJson, {
    lineId: lineId,
    type: body.type,
    length: length,
  });

  const lineImages = await updateFeatureImagesInS3(lineId, body.images);

  const isMeasured = body.length ? body.isMeasured : false;
  const line: DDBLineDetailItem = {
    lineId,
    geoJson: JSON.stringify(processedGeoJson),
    name: body.name,
    description: body.description,
    type: body.type,
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
    images: lineImages,
  };
  await db.putLine(line);
  res.json(getLineDetailsResponse(line));
};

export const updateLine = async (req: Request<any, any, UpdateLinePostBody>, res: Response) => {
  verifyRequestClaims(req);

  const lineId = req.params.id;
  const body = validateApiPayload(req.body, updateLineSchema);
  await validateMapFeatureEditor(lineId, req.user?.isaId, true);

  const geoJson = body.geoJson as unknown as FeatureCollection;

  const line = await db.getLineDetails(lineId);
  if (!line) {
    throw new Error('NotFound: Line not found');
  }

  if (!validateLineGeoJson(geoJson, body.length)) {
    throw new Error('Validation: Invalid geoJson');
  }

  const length = parseFloat((body.length || turf.length(geoJson.features[0], { units: 'meters' })).toFixed(2));

  const processedGeoJson = processLineGeoJson(geoJson, {
    lineId: lineId,
    type: body.type,
    length: length,
  });

  const lineImages = await updateFeatureImagesInS3(lineId, body.images);

  const payload = { ...req.body, images: lineImages, length, geoJson: JSON.stringify(processedGeoJson) };
  const updatedLine = assignFromSourceToTarget(payload, line);
  updatedLine.lastModifiedDateTime = new Date().toISOString();
  await db.putLine(updatedLine);
  res.json(getLineDetailsResponse(updatedLine));
};

export const deleteLine = async (req: Request, res: Response) => {
  const lineId = req.params.id;
  await validateMapFeatureEditor(lineId, req.user?.isaId, true);
  await db.deleteLine(lineId);
  res.json({});
};

export const lineApi = express.Router();
lineApi.post('/', catchExpressJsErrorWrapper(createLine));
lineApi.get('/:id/details', catchExpressJsErrorWrapper(getLineDetails));
lineApi.get('/:id/geojson', catchExpressJsErrorWrapper(getLineGeoJson));
lineApi.put('/:id', catchExpressJsErrorWrapper(updateLine));
lineApi.delete('/:id', catchExpressJsErrorWrapper(deleteLine));
