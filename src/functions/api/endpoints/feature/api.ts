import express, { Request, Response } from 'express';
import {
  catchExpressJsErrorWrapper,
  constructPaginationResponse,
  destructPaginationQueryParam,
  verifyRequestClaims,
} from '../../utils';
import { addTemporaryEditorChangelogToFeature, getChangelogsOfFeature } from 'core/features/mapFeature/changelog';
import { MapFeatureType } from 'core/types';
import { getFeatureChangelogsResponse } from './dto';
import * as db from 'core/db';
import { addTemporaryEditorToMapFeature } from 'core/features/mapFeature/editors';
import { logger } from 'core/utils/logger';
import { GenericFeature } from 'core/features/mapFeature/types';
import { genericFeatureFromItem } from 'core/features/mapFeature';

export const getFeatureChangelogs = async (
  req: Request<{
    id: string;
    type: MapFeatureType;
  }>,
  res: Response,
) => {
  const { cursor } = destructPaginationQueryParam(req.query);

  const { changelogs, lastEvaluatedKey } = await getChangelogsOfFeature(req.params.id, req.params.type, {
    limit: 20,
    startKey: cursor,
  });
  res.json(getFeatureChangelogsResponse(changelogs, constructPaginationResponse(lastEvaluatedKey)));
};

export const requestTemporaryEditorship = async (
  req: Request<{
    id: string;
    type: MapFeatureType;
  }>,
  res: Response,
) => {
  const requestClaims = verifyRequestClaims(req);
  const featureId = req.params.id;
  const featureType = req.params.type;

  let feature: GenericFeature;
  if (featureType === 'line') {
    const line = await db.getLineDetails(featureId);
    if (!line) {
      throw new Error('NotFound: Line not found');
    }
    feature = genericFeatureFromItem(line);
  } else if (featureType === 'spot') {
    const spot = await db.getSpotDetails(featureId);
    if (!spot) {
      throw new Error('NotFound: Spot not found');
    }
    feature = genericFeatureFromItem(spot);
  } else if (featureType === 'guide') {
    throw new Error('Temporary editor for guides is not supported');
  } else {
    throw new Error('Invalid feature type');
  }

  await addTemporaryEditorToMapFeature(feature.id, feature.type, requestClaims.isaId);
  await addTemporaryEditorChangelogToFeature(
    feature.id,
    feature.type,
    requestClaims.isaId,
    new Date(),
    feature.country,
  );

  logger.info('added temporary editor for line', { user: req.user, featureId, featureType });
  res.json({});
};

export const featureApi = express.Router();
featureApi.get('/:id/:type/changelogs', catchExpressJsErrorWrapper(getFeatureChangelogs));
featureApi.put('/:id/:type/requestTemporaryEditorship', catchExpressJsErrorWrapper(requestTemporaryEditorship));
