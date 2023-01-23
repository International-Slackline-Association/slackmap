import { FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import axios from 'axios';
import * as db from 'core/db';
import * as turf from '@turf/turf';
import { getOrganizationMembers } from 'core/externalApi/account-api';

const cache = {
  associationsGeoJson: undefined as FeatureCollection<Polygon | MultiPolygon> | undefined,
  associationsInfo: undefined as { [key: string]: { id: string; name: string } } | undefined,
};

const getAssociationsData = async () => {
  if (cache.associationsGeoJson && cache.associationsInfo) {
    return {
      associationsGeoJson: cache.associationsGeoJson,
      associationsInfo: cache.associationsInfo,
    };
  }
  const geoJson = await axios
    .get(
      'https://raw.githubusercontent.com/International-Slackline-Association/slackline-data/master/communities/associations/associations.geojson',
    )
    .then((r) => r.data);
  const details = await axios
    .get(
      'https://raw.githubusercontent.com/International-Slackline-Association/slackline-data/master/communities/associations/associations.json',
    )
    .then((r) => r.data);

  const info: { [key: string]: { id: string; name: string } } = {};

  for (const a of details) {
    info[a.id] = a;
  }

  cache.associationsGeoJson = geoJson as FeatureCollection<Polygon | MultiPolygon>;
  cache.associationsInfo = info;

  return {
    associationsGeoJson: cache.associationsGeoJson,
    associationsInfo: cache.associationsInfo,
  };
};

export const refreshOrganizationMemberEditorsOfFeature = async (featureId: string, geoJson: FeatureCollection) => {
  const { associationsGeoJson, associationsInfo } = await getAssociationsData();

  const associationsContainingFeature: string[] = [];
  for (const assoc of associationsGeoJson.features) {
    const center = turf.centerOfMass(geoJson);
    if (turf.booleanPointInPolygon(center, assoc)) {
      associationsContainingFeature.push(...(assoc.properties?.organizationIds ?? []));
    }
  }
  await db.deleteAllMapFeatureEditors(featureId, { grantType: 'organizationMembership' });

  const alreadyAddedMembersForFeature = new Set<string>();
  for (const assocId of associationsContainingFeature) {
    const members = await getOrganizationMembers(assocId);
    for (const member of members) {
      if (alreadyAddedMembersForFeature.has(member.userId)) {
        continue;
      }
      await db.putMapFeatureEditor({
        featureId: featureId,
        editorUserId: member.userId,
        createdDateTime: new Date().toISOString(),
        grantedThrough: 'organizationMembership',
        grantedByUserId: assocId,
        userIdentityType: 'individual',
        editorName: member.name,
        editorSurname: member.surname,
      });
      alreadyAddedMembersForFeature.add(member.userId);
    }

    await db.putMapFeatureEditor({
      featureId: featureId,
      editorUserId: assocId,
      createdDateTime: new Date().toISOString(),
      grantedThrough: 'organizationMembership',
      userIdentityType: 'organization',
      editorName: associationsInfo[assocId].name,
      editorSurname: '',
    });
  }
};

export const validateMapFeatureEditor = async (featureId: string, userId?: string, shouldThrow?: boolean) => {
  if (!userId) {
    if (shouldThrow) {
      throw new Error('Forbidden: User is not logged in');
    }
    return false;
  }
  const featureEditor = await db.getMapFeatureEditor(featureId, userId);
  if (!featureEditor && shouldThrow) {
    throw new Error('Forbidden: User is not an editor of this feature');
  }
  return Boolean(featureEditor);
};
