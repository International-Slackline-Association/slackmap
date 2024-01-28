import { DDBTableKeyAttrs } from 'core/db/types';
import { MapFeatureChangelogAction, MapFeatureType } from 'core/types';

interface ParsedKeyAttrs {
  featureId: string;
  featureType: MapFeatureType;
  country: string;
  date: string;
}

interface NonKeyAttrs {
  userId: string;
  action: MapFeatureChangelogAction;
  updatedPaths?: string[];
}

export type DDBMapFeatureChangelogItem = ParsedKeyAttrs & NonKeyAttrs;
export type DDBMapFeatureChangelogAttrs = DDBTableKeyAttrs & NonKeyAttrs;

// X updated the name of the line: XX, X updated the name
// X updated the some information of the line: XX, X updated the some information
// X updated the coordinates of the line: XX, X updated the coordinates
// X updated the images of the line: XX, X updated the images

// X created a new line: XX, X created a new line

// X deleted a line: XX, X delete a line

// X changed the owner of the line: XX, X changed the owner
// X has been granted temporary editor rights for the line: XX
