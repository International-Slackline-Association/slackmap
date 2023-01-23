import type { ScheduledHandler } from 'aws-lambda';
import { DDBGuideDetailItem } from 'core/db/guide/details/types';
import { DDBLineDetailItem } from 'core/db/line/details/types';
import { DDBSpotDetailItem } from 'core/db/spot/details/types';
import { refreshGuideGeoJsonFiles, refreshLineGeoJsonFiles, refreshSpotGeoJsonFiles } from 'core/features/geojson';
import { logger } from 'core/utils/logger';

import { refreshOrganizationMemberEditorsOfFeature } from 'core/features/mapFeature';

logger.updateMeta({ lambdaName: 'cronJob' });

const cronJobHandler: ScheduledHandler = async (event, context, callback) => {
  try {
    await runGenericCronJob();
  } catch (err) {
    if (err instanceof Error) {
      logger.error('cronJobHandler failed', { message: err.message, stack: err.stack });
    }
  } finally {
    callback(null);
  }
};

const runGenericCronJob = async () => {
  const { allLines } = await refreshLineGeoJsonFiles();
  const { allSpots } = await refreshSpotGeoJsonFiles();
  const { allGuides } = await refreshGuideGeoJsonFiles();

  const allFeatures = [...(allLines?.items ?? []), ...(allSpots?.items ?? []), ...(allGuides?.items ?? [])];

  for (const f of allFeatures) {
    const feature = genericFeature(f);
    if (!feature) {
      continue;
    }
    await refreshOrganizationMemberEditorsOfFeature(feature.id, feature.geoJson);
  }
};

const genericFeature = (feature: DDBLineDetailItem | DDBSpotDetailItem | DDBGuideDetailItem) => {
  if ('lineId' in feature) {
    return {
      type: 'line',
      id: feature.lineId,
      geoJson: JSON.parse(feature.geoJson),
    };
  }
  if ('spotId' in feature) {
    return {
      type: 'spot',
      id: feature.spotId,
      geoJson: JSON.parse(feature.geoJson),
    };
  }
  if ('guideId' in feature) {
    return {
      type: 'guide',
      id: feature.guideId,
      geoJson: JSON.parse(feature.geoJson),
    };
  }
};

export const main = cronJobHandler;
