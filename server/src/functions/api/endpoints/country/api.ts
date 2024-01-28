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

  return { items: changelogs, pagination: constructPaginationResponse(lastEvaluatedKey) };
};

export const countryApi = express.Router();
countryApi.get('/:code/details', expressRoute(getCountryDetails));
countryApi.get('/:code/changelogs', expressRoute(getCountryChangelogs));
