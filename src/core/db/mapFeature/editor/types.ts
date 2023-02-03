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
  grantedThrough: EditorGrantType;
  grantedByUserId?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
}

export type EditorGrantType = 'explicit' | 'organizationMembership' | 'temporary' | 'admin';
export type DDBMapFeatureEditorItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBMapFeatureEditorAttrs = DDBTableKeyAttrs & NonKeyAttrs;
