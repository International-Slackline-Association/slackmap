import { getCountryContributorsStats } from 'core/features/contributors';
import { getMultipleUserDetails } from 'core/features/isaUser';
import { getChangelogsOfCountry } from 'core/features/mapFeature/changelog';
import countriesJson from 'data/countryInfoDict.json';
import express, { Request } from 'express';

import {
  constructPaginationResponse,
  destructPaginationQueryParam,
  expressRoute,
} from '../../utils';

export const getCountryDetails = async (req: Request) => {
  const countryCode = req.params.code;
  const countryInfo = countriesJson[countryCode.toUpperCase() as keyof typeof countriesJson];

  return { name: countryInfo.name };
};

export const getCountryChangelogs = async (req: Request) => {
  const countryCode = req.params.code;
  const { cursor } = destructPaginationQueryParam(req.query);

  const { changelogs, lastEvaluatedKey } = await getChangelogsOfCountry(countryCode.toUpperCase(), {
    limit: 20,
    startKey: cursor,
  });

  const items = changelogs
    .map((c) => {
      const item = { ...c, htmlText: '' };
      const fullname = c.user?.fullname ?? 'Unknown User';
      switch (c.actionType) {
        case 'created':
          item.htmlText = `<b>${fullname}</b> has created a ${c.featureType}.`;
          break;
        case 'updatedDetails':
          item.htmlText = `<b>${fullname}</b> updated the <b>${
            c.updatedPathsString || 'details'
          }</b> of the ${c.featureType}.`;
          break;
        case 'grantedTemporaryEditor':
          item.htmlText = `<b>${fullname}</b> has been granted temporary editor rights for the ${c.featureType}.`;
          break;
        case 'updatedOwners':
          item.htmlText = `<b>${fullname}</b> changed the owner of the ${c.featureType}.`;
          break;
        default:
          break;
      }
      return item;
    })
    .filter((c) => c.htmlText !== '');

  return { items, pagination: constructPaginationResponse(lastEvaluatedKey) };
};

export const getCountryContributorStats = async (req: Request) => {
  const stats = await getCountryContributorsStats(req.params.code);
  const userDetailsDict = await getMultipleUserDetails(stats.map((s) => s.userId));
  const items = stats.map((s) => {
    const userInfo = userDetailsDict[s.userId];
    return {
      user: {
        id: s.userId,
        fullName: userInfo?.fullname ?? 'Unknown User',
      },
      added: {
        features: s.added.features.map((f) => ({
          url: `https://slackmap.com/${f.type}/${f.id}`,
        })),
        count: s.added.count,
      },
      updated: {
        features: s.updated.features.map((f) => ({
          url: `https://slackmap.com/${f.type}/${f.id}`,
        })),
        count: s.updated.count,
      },
    };
  });
  return { items };
};

export const countryApi = express.Router();
countryApi.get('/:code/details', expressRoute(getCountryDetails));
countryApi.get('/:code/changelogs', expressRoute(getCountryChangelogs));
countryApi.get('/:code/contributors', expressRoute(getCountryContributorStats));
