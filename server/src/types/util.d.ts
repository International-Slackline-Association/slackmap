type Prettify<T> = {
  // [K in keyof T]: T[K];
  [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
} & unknown;
