import { FeatureCollection } from '@turf/turf';
import * as db from 'core/db';
import * as turf from '@turf/turf';
import { calculateCenterOfFeature } from '../geojson/utils';
import { getAssociationsData } from 'core/externalApi/slackline-data-api';
import { MapFeatureType } from 'core/types';
import { getUserDetails, getUsersOfOrganization } from '../isaUser';

export const refreshRepresentativeEditorsOfMapFeature = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: { countryCode?: string; geoJson: FeatureCollection },
) => {
  const { associationsGeoJson } = await getAssociationsData();

  const representativeOrganizations: string[] = [];
  for (const assoc of associationsGeoJson.features) {
    const organizations = assoc.properties?.organizationIds;
    if (!organizations) {
      continue;
    }
    if (opts.countryCode) {
      if (assoc.properties?.id === opts.countryCode) {
        representativeOrganizations.push(...organizations);
      }
    } else {
      const center = calculateCenterOfFeature(opts.geoJson);
      if (turf.booleanPointInPolygon(center, assoc)) {
        representativeOrganizations.push(...organizations);
      }
    }
  }
  if (representativeOrganizations.length === 0) {
    await db.deleteAllFeatureEditors(featureId, featureType, {
      reason: ['areaRepresentative', 'representativeMember'],
    });
  } else {
    const alreadyAddedMembersForFeature = new Set<string>();
    for (const assocId of representativeOrganizations) {
      await db.putFeatureEditor({
        featureId: featureId,
        featureType: featureType,
        userId: assocId,
        reason: 'areaRepresentative',
        userIdentityType: 'organization',
        createdDateTime: new Date().toISOString(),
      });
      const userIds = await getUsersOfOrganization(assocId);
      for (const userId of userIds) {
        if (alreadyAddedMembersForFeature.has(userId)) {
          continue;
        }
        await db.putFeatureEditor({
          featureId: featureId,
          featureType: featureType,
          userId: userId,
          createdDateTime: new Date().toISOString(),
          reason: 'representativeMember',
          grantedByUserId: assocId,
          userIdentityType: 'individual',
        });
        alreadyAddedMembersForFeature.add(userId);
      }
    }
  }
};

// Add SlackMap Admin Account as an editor
export const addAdminAsEditorToMapFeature = async (featureId: string, featureType: MapFeatureType) => {
  await db.putFeatureEditor({
    featureId: featureId,
    featureType: featureType,
    userId: 'ISA_C87BE5F6',
    createdDateTime: new Date().toISOString(),
    reason: 'admin',
    userIdentityType: 'individual',
  });
};

export const addTemporaryEditorToMapFeature = async (
  featureId: string,
  featureType: MapFeatureType,
  userId: string,
) => {
  const hasNoEditors = await validateMapFeatureHasNoEditors(featureId, featureType);

  if (!hasNoEditors) {
    throw new Error(`Forbidden: This ${featureType} already has editors`);
  }
  const isaUser = await getUserDetails(userId);
  if (isaUser) {
    await db.putFeatureEditor({
      featureId: featureId,
      featureType: featureType,
      userId: userId,
      reason: 'temporary',
      userIdentityType: isaUser.identityType,
      createdDateTime: new Date().toISOString(),
      ddb_ttl: Math.round(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    });
  }
};

export const validateMapFeatureEditor = async (
  featureId: string,
  featureType: MapFeatureType,
  userId?: string,
  shouldThrow?: boolean,
) => {
  if (!userId) {
    if (shouldThrow) {
      throw new Error('Forbidden: User is not logged in');
    }
    return null;
  }
  const featureEditor = await db.getFeatureEditor(featureId, featureType, userId);

  if (!featureEditor && shouldThrow) {
    throw new Error(`Forbidden: User is not an editor of this ${featureType}`);
  }
  return featureEditor;
};

export const validateMapFeatureHasNoEditors = async (featureId: string, featureType: MapFeatureType) => {
  const editors = await db.getFeatureEditors(featureId, featureType, { limit: 2 });
  if (editors.length === 0) {
    return true;
  }
  if (editors.length === 1 && editors[0].reason === 'admin') {
    return true;
  }
  return false;
};
