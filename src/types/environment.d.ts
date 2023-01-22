declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPLICATION_LOG_GROUP_NAME: string;
      SLACKMAP_TABLE_NAME: string;
      SLACKMAP_APPLICATION_DATA_S3_BUCKET: string;
      SLACKMAP_IMAGES_S3_BUCKET: string;
      DISABLE_STREAMS?: string;
    }
  }
}

export {};
