import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from 'core/aws/clients';
import { db } from 'core/db';
import { MapFeatureType } from 'core/types';

type Stat = { features: { id: string; type: MapFeatureType }[]; count: number };

export const refreshGlobalContributorsToS3 = async () => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const {
    items: { mapFeatureChangelogs },
  } = await db.getGlobalChangelogs({ untilDate: oneYearAgo.toISOString() });
  const featureChangelogs = await db.getMultipleFeatureChangelog(mapFeatureChangelogs);

  const userStats: Record<string, { userId: string; added: Stat; updated: Stat }> = {};

  for (const changelog of featureChangelogs) {
    const userId = changelog.userId;
    if (!userStats[userId]) {
      userStats[userId] = {
        userId: changelog.userId,
        added: { features: [], count: 0 },
        updated: { features: [], count: 0 },
      };
    }

    const userStat = userStats[userId];
    const featureType = changelog.featureType;
    const featureId = changelog.featureId;

    if (changelog.action === 'created') {
      userStat.added.features.push({ id: featureId, type: featureType });
      userStat.added.count++;
    } else if (changelog.action === 'updatedDetails') {
      if (!userStat.updated.features.find((f) => f.id === featureId)) {
        userStat.updated.features.push({ id: featureId, type: featureType });
        userStat.updated.count++;
      }
    }
  }

  const sortedUserStats = Object.values(userStats)
    .sort((a, b) => {
      return b.added.count + b.updated.count - (a.added.count + a.updated.count);
    })
    .slice(0, 50);

  await writeToS3('contributors/ranking.json', sortedUserStats);

  const summaryStats = sortedUserStats.slice(0, 30).map((user) => {
    return {
      userId: user.userId,
      added: user.added.count,
      updated: user.updated.count,
    };
  });

  await writeToS3('contributors/ranking-summary.json', summaryStats);
  return sortedUserStats;
};

export const getGlobalContributorsSummaryFromS3 = async () => {
  return getFromS3('contributors/ranking-summary.json') as Promise<
    { userId: string; added: number; updated: number }[]
  >;
};

const writeToS3 = async (
  key: string,
  stats: { userId: string; added: Stat | number; updated: Stat | number }[],
) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.SLACKMAP_APPLICATION_DATA_S3_BUCKET,
      Key: key,
      Body: JSON.stringify(stats),
      ContentType: 'application/json; charset=utf-8',
    }),
  );
};

const getFromS3 = async (key: string) => {
  const s3Image = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.SLACKMAP_APPLICATION_DATA_S3_BUCKET,
      Key: key,
    }),
  );

  const streamToString = await s3Image.Body!.transformToString('utf-8');
  return JSON.parse(streamToString) as {
    userId: string;
    added: Stat | number;
    updated: Stat | number;
  }[];
};
