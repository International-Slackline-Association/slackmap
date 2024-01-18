/// <reference types="vite/client" />

declare const __APP_VERSION__: string; // injected by vite.config.ts

interface ImportMetaEnv {
  readonly VITE_APP_SLACKMAP_MAPBOX_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
