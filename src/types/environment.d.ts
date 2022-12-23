declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPLICATION_LOG_GROUP_NAME: string;
      SLACKMAP_TABLE_NAME: string;
      SLACKMAP_APPLICATION_DATA_S3_BUCKET: string;
      SLACKMAP_APPLICATION_DATA_CLOUDFRONT_ID: string;
    }
  }
}

export {};
