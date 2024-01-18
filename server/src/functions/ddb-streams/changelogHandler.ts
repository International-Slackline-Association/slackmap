import { DDBAttributeItem } from 'core/db/types';

export const processFeatureChangelogOperation = async (
  newItem: DDBAttributeItem | undefined,
  oldItem: DDBAttributeItem | undefined,
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined,
) => {
  if (eventName === 'INSERT' && newItem) {
    // const newChangelog = featureChangelogDBUtils.attrsToItem(newItem);
    // update country geojson, add country if missing
  }

  // if (eventName === 'MODIFY' && newItem && oldItem) {
  //   const oldChangelog = featureChangelogDBUtils.attrsToItem(oldItem);
  //   const updatedChangelog = featureChangelogDBUtils.attrsToItem(newItem);

  // }

  if (eventName === 'REMOVE' && oldItem) {
    // const oldChangelog = featureChangelogDBUtils.attrsToItem(oldItem);
    // update country geojson, remove if no features left
  }
};
