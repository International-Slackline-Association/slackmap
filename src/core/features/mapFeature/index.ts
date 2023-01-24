import { FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import * as db from 'core/db';
import * as turf from '@turf/turf';
import { getOrganizationMembers } from 'core/externalApi/account-api';
import { calculateCenterOfFeature } from '../geojson/utils';
import { getAssociationsData } from 'core/externalApi/slackline-data-api';
import * as accountApi from 'core/externalApi/account-api';

export const refreshOrganizationMemberEditorsOfFeature = async (
  featureId: string,
  opts: { countryCode?: string; geoJson: FeatureCollection },
) => {
  const { associationsGeoJson, associationsInfo } = await getAssociationsData();

  const associationsContainingFeature: string[] = [];
  for (const assoc of associationsGeoJson.features) {
    const organizations = assoc.properties?.organizationIds;
    if (!organizations) {
      continue;
    }
    if (opts.countryCode) {
      if (assoc.properties?.id === opts.countryCode) {
        associationsContainingFeature.push(...organizations);
      }
    } else {
      const center = calculateCenterOfFeature(opts.geoJson);
      if (turf.booleanPointInPolygon(center, assoc)) {
        associationsContainingFeature.push(...organizations);
      }
    }
  }
  await db.deleteAllMapFeatureEditors(featureId, { exceptGrantType: 'organizationMembership' });

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

export const addTemporaryEditorToMapFeature = async (featureId: string, userId: string) => {
  const hasNoEditors = await validateMapFeatureHasNoEditors(featureId);

  if (hasNoEditors) {
    const isaUser = await accountApi.getBasicUserDetails(userId);
    await db.putMapFeatureEditor({
      featureId: featureId,
      editorUserId: userId,
      createdDateTime: new Date().toISOString(),
      grantedThrough: 'temporary',
      userIdentityType: isaUser.identityType,
      editorName: isaUser.name,
      editorSurname: isaUser.surname,
    });
  }
};

export const validateMapFeatureEditor = async (featureId: string, userId?: string, shouldThrow?: boolean) => {
  if (!userId) {
    if (shouldThrow) {
      throw new Error('Forbidden: User is not logged in');
    }
    return null;
  }
  const featureEditor = await db.getMapFeatureEditor(featureId, userId);
  if (!featureEditor && shouldThrow) {
    throw new Error('Forbidden: User is not an editor of this feature');
  }
  return featureEditor;
};

export const validateMapFeatureHasNoEditors = async (featureId: string) => {
  const editors = await db.getMapFeatureEditors(featureId, { limit: 1 });
  return editors.length === 0;
};
