import { DDBTableKeyAttrs } from 'core/db/types';
import { UserIdentityType } from 'core/types';

interface ParsedKeyAttrs {
  lineId: string;
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

export type DDBLineEditorItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBLineEditorAttrs = DDBTableKeyAttrs & NonKeyAttrs;
