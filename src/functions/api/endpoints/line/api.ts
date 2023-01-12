import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper, validateApiPayload, verifyRequestClaims } from '../../utils';
import * as db from 'core/db';
import { getLineDetailsResponse } from './dto';
import { FeatureCollection, LineString } from '@turf/turf';
import { CreateLinePostBody, createLineSchema } from './schema';
import { validateLineGeoJson } from 'core/features/line/validations';
import { nanoid } from 'nanoid';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import * as turf from '@turf/turf';
import { validateLineEditor } from 'core/features/line';
import { processLineGeoJson } from 'core/features/geojson';

export const getLineDetails = async (req: Request, res: Response) => {
  const line = await db.getLineDetails(req.params.id);
  if (!line) {
    throw new Error(`NotFound: Line ${req.params.id} not found`);
  }
  const isUserEditor = await validateLineEditor(line.lineId, req.claims?.sub);
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
    length: body.length,
  });

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
    creatorUserId: requestClaims.sub,
    createdDateTime: new Date().toISOString(),
    lastModifiedDateTime: new Date().toISOString(),
    length: length,
    height: body.height,
  };
  await db.putLine(line);
  res.json(getLineDetailsResponse(line));
};

export const updateLine = async (req: Request, res: Response) => {
  //
};

export const deleteLine = async (req: Request, res: Response) => {
  const lineId = req.params.id;
  await validateLineEditor(lineId, req.claims?.sub, true);
  await db.deleteLine(lineId);
};

export const lineApi = express.Router();
lineApi.post('/', catchExpressJsErrorWrapper(createLine));
lineApi.get('/:id/details', catchExpressJsErrorWrapper(getLineDetails));
lineApi.get('/:id/geojson', catchExpressJsErrorWrapper(getLineGeoJson));
lineApi.put('/:id', catchExpressJsErrorWrapper(updateLine));
lineApi.delete('/:id', catchExpressJsErrorWrapper(deleteLine));
