import { DDBTableKeyAttrs } from 'core/db/types';
import { UserIdentityType } from 'core/types';

interface ParsedKeyAttrs {
  featureId: string;
  editorUserId: string;
  userIdentityType: UserIdentityType;
}

interface NonKeyAttrs {
  shouldSyncMembers?: boolean;
  editorName?: string;
  editorSurname?: string;
  grantedThrough: 'explicit' | 'organizationMembership';
  createdDateTime: string;
  lastModifiedDateTime?: string;
}

export type DDBMapFeatureEditorItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBMapFeatureEditorAttrs = DDBTableKeyAttrs & NonKeyAttrs;
