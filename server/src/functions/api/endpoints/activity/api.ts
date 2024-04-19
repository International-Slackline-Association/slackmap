import { getChangelogsOfGlobal } from 'core/features/mapFeature/changelog';
import express, { Request } from 'express';

import {
  constructPaginationResponse,
  destructPaginationQueryParam,
  expressRoute,
} from '../../utils';

export const getGlobalActivityChangelogs = async (req: Request) => {
  const { cursor } = destructPaginationQueryParam(req.query);

  const { changelogs, lastEvaluatedKey } = await getChangelogsOfGlobal({
    limit: 20,
    startKey: cursor,
  });

  const items = changelogs
    .map((c) => {
      const item = { ...c, htmlText: '' };

      switch (c.actionType) {
        case 'created':
          item.htmlText = `<b>${c.userName}</b> has created the ${c.featureType}.`;
          break;
        case 'updatedDetails':
          item.htmlText = `<b>${c.userName}</b> updated the <b>${
            c.updatedPathsString || 'details'
          }</b> of the ${c.featureType}.`;
          break;
        case 'grantedTemporaryEditor':
          item.htmlText = `<b>${c.userName}</b> has been granted temporary editor rights for the ${c.featureType}.`;
          break;
        case 'updatedOwners':
          item.htmlText = `<b>${c.userName}</b> changed the owner of the ${c.featureType}.`;
          break;
        default:
          break;
      }
      return item;
    })
    .filter((c) => c.htmlText !== '');

  return { items, pagination: constructPaginationResponse(lastEvaluatedKey) };
};

export const activityApi = express.Router();
activityApi.get('/changelogs', expressRoute(getGlobalActivityChangelogs));
