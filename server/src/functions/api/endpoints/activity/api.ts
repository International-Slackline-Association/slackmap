import { getGlobalContributorsSummaryFromS3 } from 'core/features/contributors';
import { getMultipleUserDetails } from 'core/features/isaUser';
import { getChangelogsOfGlobal } from 'core/features/mapFeature/changelog';
import countriesJson from 'data/countryInfoDict.json';
import express, { Request } from 'express';

import {
  constructPaginationResponse,
  destructPaginationQueryParam,
  expressRoute,
} from '../../utils';

export const getGlobalContributors = async (_req: Request) => {
  const stats = await getGlobalContributorsSummaryFromS3();
  const userDetailsDict = await getMultipleUserDetails(stats.map((s) => s.userId));
  const items = stats.map((s) => {
    return {
      user: {
        fullName: userDetailsDict[s.userId].fullname,
        profilePictureUrl: userDetailsDict[s.userId].profilePictureUrl,
        countryCode: userDetailsDict[s.userId].country,
        countryName:
          countriesJson[(userDetailsDict[s.userId].country ?? '') as keyof typeof countriesJson]
            ?.name,
      },
      added: s.added,
      updated: s.updated,
    };
  });
  return { items };
};

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
          item.htmlText = `<b>${c.user.fullname}</b> has created the ${c.featureType} in <b>${c.countryName}</b>.`;
          break;
        case 'updatedDetails':
          item.htmlText = `<b>${c.user.fullname}</b> updated the <b>${
            c.updatedPathsString || 'details'
          }</b> of the ${c.featureType} in <b>${c.countryName}</b>.`;
          break;
        case 'grantedTemporaryEditor':
          item.htmlText = `<b>${c.user.fullname}</b> has been granted temporary editor rights for the ${c.featureType} in <b>${c.countryName}</b>.`;
          break;
        case 'updatedOwners':
          item.htmlText = `<b>${c.user.fullname}</b> changed the owner of the ${c.featureType} in <b>${c.countryName}</b>.`;
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
activityApi.get('/contributors', expressRoute(getGlobalContributors));
activityApi.get('/changelogs', expressRoute(getGlobalActivityChangelogs));
