import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper } from '../../utils';
import { slacklineDataApi } from 'core/externalApi/slackline-data-api';
import countriesJson from 'data/countryInfoDict.json';
import { Feature, FeatureCollection } from '@turf/turf';
import { getOrganizationDetailsFromEmail } from 'core/db/isa-users';

export const getCountriesGeoJson = async (req: Request, res: Response) => {
  const isaMembers = await slacklineDataApi.getIsaMembersList();
  const slacklineGroupsGeoJson = await slacklineDataApi.getSlacklineGroupsGeoJson();

  const countryCodes = [
    ...isaMembers.map((member) => member.country),
    ...slacklineGroupsGeoJson.features.map((feature) => feature.properties?.c),
  ];

  const uniqueCountries = new Set(countryCodes.filter((code) => code));

  const countriesGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  for (const countryCode of uniqueCountries) {
    const countryInfo = countriesJson[countryCode as keyof typeof countriesJson];
    if (!countryInfo) {
      throw new Error(`Country: ${countryCode} not found in countryInfoDict.json`);
    }
    const feature: Feature = {
      type: 'Feature',
      properties: {
        id: countryCode,
        ft: 'comCt',
      },
      geometry: countryInfo.geometry,
    };
    countriesGeoJson.features.push(feature);
  }

  res.json(countriesGeoJson);
};

export const getCommunityCountryDetails = async (req: Request, res: Response) => {
  const countryCode = req.params.code;
  const countryInfo = countriesJson[countryCode.toUpperCase() as keyof typeof countriesJson];

  const allSlacklineGroupsPromise = slacklineDataApi.getSlacklineGroups();
  const isaMembersPromise = slacklineDataApi.getIsaMembersList().then(async (members) => {
    const filtered = members.filter((member) => member.country === countryCode);
    await fillOrganizationInformation(filtered);
    return filtered;
  });
  const countryGroupIdsPromise = slacklineDataApi.getSlacklineGroupsGeoJson().then((geoJson) => {
    return geoJson.features
      .filter((feature) => feature.properties.c === countryCode)
      .map((feature) => feature.properties.id);
  });

  const [allSlacklineGroups, isaMembers, countryGroupIds] = await Promise.all([
    allSlacklineGroupsPromise,
    isaMembersPromise,
    countryGroupIdsPromise,
  ]);

  const slacklineGroups = allSlacklineGroups
    .filter((group) => countryGroupIds.includes(group.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({ name: countryInfo.name, isaMembers, slacklineGroups });
};

export const getGroupDetails = async (req: Request, res: Response) => {
  const groupId = req.params.groupId;

  const allSlacklineGroups = await slacklineDataApi.getSlacklineGroups();
  const groupInfo = allSlacklineGroups.find((group) => group.id === groupId);
  if (!groupInfo) {
    throw new Error(`NotFound: Group with id: ${groupId} not found`);
  }

  res.json({ info: groupInfo });
};

const fillOrganizationInformation = async (isaMembers: { email?: string; profilePictureUrl?: string }[]) => {
  const promises: Promise<any>[] = [];
  for (const isaMember of isaMembers) {
    if (isaMember.email && !isaMember.profilePictureUrl) {
      promises.push(
        getOrganizationDetailsFromEmail(isaMember.email).then((org) => {
          if (org?.profilePictureUrl) {
            isaMember.profilePictureUrl = org.profilePictureUrl;
          }
        }),
      );
    }
  }
  await Promise.all(promises);
};

export const communitiesApi = express.Router();
communitiesApi.get('/countriesGeoJson', catchExpressJsErrorWrapper(getCountriesGeoJson));
communitiesApi.get('/country/:code', catchExpressJsErrorWrapper(getCommunityCountryDetails));
communitiesApi.get('/group/:groupId', catchExpressJsErrorWrapper(getGroupDetails));
