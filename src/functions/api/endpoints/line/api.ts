import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper } from '../../utils';
import * as db from 'core/db';
import { getLineDetailsResponse } from './dto';
import { FeatureCollection } from '@turf/turf';

export const getLineDetails = async (req: Request, res: Response) => {
  const line = await db.getLineDetails(req.params.id);
  if (!line) {
    throw new Error(`NotFound: Line ${req.params.id} not found`);
  }
  res.json(getLineDetailsResponse(line));
};

export const getLineGeoJson = async (req: Request, res: Response) => {
  const line = await db.getLineDetails(req.params.id, { fields: ['geoJson'] });
  if (!line || !line.geoJson) {
    throw new Error(`NotFound: Line ${req.params.id} not found`);
  }
  const lineGeoJson = JSON.parse(line.geoJson) as FeatureCollection;
  res.json(lineGeoJson);
};

export const lineApi = express.Router();
lineApi.get('/:id/details', catchExpressJsErrorWrapper(getLineDetails));
lineApi.get('/:id/geojson', catchExpressJsErrorWrapper(getLineGeoJson));
