import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper, constructPaginationResponse, destructPaginationQueryParam } from '../../utils';
import { getChangelogsOfFeature } from 'core/features/mapFeature/changelog';
import { MapFeatureType } from 'core/types';
import { getFeatureChangelogsResponse } from './dto';

export const getFeatureChangelogs = async (
  req: Request<{
    id: string;
    type: MapFeatureType;
  }>,
  res: Response,
) => {
  const { cursor } = destructPaginationQueryParam(req.query);

  const { changelogs, lastEvaluatedKey } = await getChangelogsOfFeature(req.params.id, req.params.type, {
    limit: 10,
    startKey: cursor,
  });
  res.json(getFeatureChangelogsResponse(changelogs, constructPaginationResponse(lastEvaluatedKey)));
};

export const featureApi = express.Router();
featureApi.get('/:id/:type/changelogs', catchExpressJsErrorWrapper(getFeatureChangelogs));
