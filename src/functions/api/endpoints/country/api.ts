import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper, constructPaginationResponse, destructPaginationQueryParam } from '../../utils';
import { getChangelogsOfCountry } from 'core/features/mapFeature/changelog';
import countriesJson from 'data/countryInfoDict.json';
import organizationsJson from 'data/organizations.json';
import { isaUsersDb } from 'core/db';

export const getCountryDetails = async (req: Request, res: Response) => {
  const countryCode = req.params.code;
  const countryInfo = countriesJson[countryCode.toUpperCase() as keyof typeof countriesJson];

  const organizationsOfCountry = organizationsJson
    .filter((org) => org.countries?.includes(countryCode.toUpperCase()))
    .map((org) => org.id);

  const organizations = await isaUsersDb.getMultipleOrganizationDetails(organizationsOfCountry);

  res.json({ name: countryInfo.name, organizations });
};

export const getCountryChangelogs = async (req: Request, res: Response) => {
  const countryCode = req.params.code;
  const { cursor } = destructPaginationQueryParam(req.query);

  const { changelogs, lastEvaluatedKey } = await getChangelogsOfCountry(countryCode.toUpperCase(), {
    limit: 20,
    startKey: cursor,
  });

  res.json({ items: changelogs, pagination: constructPaginationResponse(lastEvaluatedKey) });
};

export const countryApi = express.Router();
countryApi.get('/:code/details', catchExpressJsErrorWrapper(getCountryDetails));
countryApi.get('/:code/changelogs', catchExpressJsErrorWrapper(getCountryChangelogs));
