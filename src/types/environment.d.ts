declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPLICATION_LOG_GROUP_NAME: string;
      SLACKMAP_TABLE_NAME: string;
    }
  }
}

export {};
