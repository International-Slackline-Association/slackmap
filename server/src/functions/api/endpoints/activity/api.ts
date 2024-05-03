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
    const userInfo = userDetailsDict[s.userId];
    const countryName =
      countriesJson[(userInfo?.country ?? '') as keyof typeof countriesJson]?.name;
    return {
      user: {
        fullName: userInfo?.fullname ?? 'Unknown User',
        profilePictureUrl: userInfo?.profilePictureUrl,
        countryCode: userInfo?.country,
        countryName,
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
      const fullname = c.user?.fullname ?? 'Unknown User';
      switch (c.actionType) {
        case 'created':
          item.htmlText = `<b>${fullname}</b> has created a ${c.featureType} in <b>${c.countryName}</b>.`;
          break;
        case 'updatedDetails':
          item.htmlText = `<b>${fullname}</b> updated the <b>${
            c.updatedPathsString || 'details'
          }</b> of the ${c.featureType} in <b>${c.countryName}</b>.`;
          break;
        case 'grantedTemporaryEditor':
          item.htmlText = `<b>${fullname}</b> has been granted temporary editor rights for the ${c.featureType} in <b>${c.countryName}</b>.`;
          break;
        case 'updatedOwners':
          item.htmlText = `<b>${fullname}</b> changed the owner of the ${c.featureType} in <b>${c.countryName}</b>.`;
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
