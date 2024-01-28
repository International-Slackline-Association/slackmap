import * as db from 'core/db';
import { genericFeatureFromItem } from 'core/features/mapFeature';
import {
  addTemporaryEditorChangelogToFeature,
  getChangelogsOfFeature,
} from 'core/features/mapFeature/changelog';
import {
  addTemporaryEditorToMapFeature,
  validateMapFeatureEditor,
} from 'core/features/mapFeature/editors';
import { GenericMapFeatureItemType } from 'core/features/mapFeature/types';
import { MapFeatureType } from 'core/types';
import { logger } from 'core/utils/logger';
import express, { Request } from 'express';

import {
  constructPaginationResponse,
  destructPaginationQueryParam,
  expressRoute,
  validateApiPayload,
  verifyRequestClaims,
} from '../../utils';
import { getFeatureChangelogsResponse } from './dto';
import { DeleteFeatureRequestPostBody, deleteFeatureRequestSchema } from './schema';

export const getFeatureChangelogs = async (
  req: Request<{
    id: string;
    type: MapFeatureType;
  }>,
) => {
  const { cursor } = destructPaginationQueryParam(req.query);

  const { changelogs, lastEvaluatedKey } = await getChangelogsOfFeature(
    req.params.id,
    req.params.type,
    {
      limit: 20,
      startKey: cursor,
    },
  );

  return getFeatureChangelogsResponse(changelogs, constructPaginationResponse(lastEvaluatedKey));
};

export const requestTemporaryEditorship = async (
  req: Request<{
    id: string;
    type: MapFeatureType;
  }>,
) => {
  const requestClaims = verifyRequestClaims(req);
  const featureId = req.params.id;
  const featureType = req.params.type;

  let item: GenericMapFeatureItemType | null;
  switch (featureType) {
    case 'line':
      item = await db.getLineDetails(featureId);
      break;
    case 'spot':
      item = await db.getSpotDetails(featureId);
      break;
    case 'guide':
      item = await db.getGuideDetails(featureId);
      break;
    default:
      throw new Error('Invalid feature type');
  }
  if (!item) {
    throw new Error(`NotFound: ${featureType} ${featureId} not found`);
  }
  const feature = genericFeatureFromItem(item);

  await addTemporaryEditorToMapFeature(feature.id, feature.type, requestClaims.isaId);
  await addTemporaryEditorChangelogToFeature(
    feature.id,
    feature.type,
    requestClaims.isaId,
    new Date(),
    feature.country,
  );

  logger.info(`added temporary editor for ${feature.type}`, {
    user: req.user,
    featureId,
    featureType,
  });
  return {};
};

export const deleteFeature = async (
  req: Request<{
    id: string;
    type: MapFeatureType;
  }>,
) => {
  const editor = await validateMapFeatureEditor(req.params.id, req.params.type, req.user?.isaId, {
    shouldThrow: true,
  });
  if (editor?.reason !== 'explicit') {
    throw new Error('Forbidden: Only explicit editors can delete a feaure');
  }
  switch (req.params.type) {
    case 'line':
      await db.deleteLine(req.params.id);
      break;
    case 'spot':
      await db.deleteSpot(req.params.id);
      break;
    case 'guide':
      await db.deleteGuide(req.params.id);
      break;
    default:
      throw new Error('Invalid feature type');
  }

  logger.info(`deleted ${req.params.type}`, {
    user: req.user,
    id: req.params.id,
  });
  return {};
};

export const deleteFeatureRequest = async (
  req: Request<
    {
      id: string;
      type: MapFeatureType;
    },
    any,
    DeleteFeatureRequestPostBody
  >,
) => {
  const body = validateApiPayload(req.body, deleteFeatureRequestSchema);
  logger.info('Feature Delete Request', {
    user: req.user,
    feature: {
      id: req.params.id,
      type: req.params.type,
    },
    reason: body.reason,
  });
  return {};
};

export const featureApi = express.Router();
featureApi.get('/:id/:type/changelogs', expressRoute(getFeatureChangelogs));
featureApi.put('/:id/:type/requestTemporaryEditorship', expressRoute(requestTemporaryEditorship));
featureApi.post('/:id/:type/deleteRequest', expressRoute(deleteFeatureRequest));
featureApi.delete('/:id/:type', expressRoute(deleteFeature));
