import * as db from 'core/db';
import { MapFeatureType } from 'core/types';
import { getUserDetails, getUsersOfOrganization } from '../isaUser';
import organizationsJson from 'data/organizations.json';

export const refreshRepresentativeEditorsOfMapFeature = async (
  featureId: string,
  featureType: MapFeatureType,
  opts: { countryCode: string },
) => {
  const representativeOrganizations: string[] = [];

  // TODO: Switch to loading organizations from DB
  for (const organization of organizationsJson) {
    if (organization.countries.includes(opts.countryCode)) {
      representativeOrganizations.push(...organization.id);
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
  opts: {
    shouldThrow?: boolean;
  } = {},
) => {
  if (!userId) {
    if (opts.shouldThrow) {
      throw new Error('Forbidden: User is not logged in');
    }
    return null;
  }
  const featureEditor = await db.getFeatureEditor(featureId, featureType, userId);

  if (!featureEditor && opts.shouldThrow) {
    throw new Error(`Forbidden: User is not an editor of this ${featureType}`);
  }
  return featureEditor;
};
