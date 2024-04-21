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

      switch (c.actionType) {
        case 'created':
          item.htmlText = `<b>${c.user.fullname}</b> has created the ${c.featureType}.`;
          break;
        case 'updatedDetails':
          item.htmlText = `<b>${c.user.fullname}</b> updated the <b>${
            c.updatedPathsString || 'details'
          }</b> of the ${c.featureType}.`;
          break;
        case 'grantedTemporaryEditor':
          item.htmlText = `<b>${c.user.fullname}</b> has been granted temporary editor rights for the ${c.featureType}.`;
          break;
        case 'updatedOwners':
          item.htmlText = `<b>${c.user.fullname}</b> changed the owner of the ${c.featureType}.`;
          break;
        default:
          break;
      }
      return item;
    })
    .filter((c) => c.htmlText !== '');

  return { items, pagination: constructPaginationResponse(lastEvaluatedKey) };
};

export const countryApi = express.Router();
countryApi.get('/:code/details', expressRoute(getCountryDetails));
countryApi.get('/:code/changelogs', expressRoute(getCountryChangelogs));
