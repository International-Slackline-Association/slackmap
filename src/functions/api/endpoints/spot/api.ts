import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper } from '../../utils';
import * as db from 'core/db';
import { getSpotDetailsResponse } from './dto';
import { FeatureCollection } from '@turf/turf';

export const getSpotDetails = async (req: Request, res: Response) => {
  const spot = await db.getSpotDetails(req.params.id);
  if (!spot) {
    throw new Error('NotFound: Spot not found');
  }
  res.json(getSpotDetailsResponse(spot));
};

export const getSpotGeoJson = async (req: Request, res: Response) => {
  const spot = await db.getSpotDetails(req.params.id, { fields: ['geoJson'] });
  if (!spot || !spot.geoJson) {
    throw new Error('NotFound: Spot not found');
  }
  const geoJson = JSON.parse(spot.geoJson) as FeatureCollection;
  res.json(geoJson);
};

export const spotApi = express.Router();
spotApi.get('/:id/details', catchExpressJsErrorWrapper(getSpotDetails));
spotApi.get('/:id/geojson', catchExpressJsErrorWrapper(getSpotGeoJson));
