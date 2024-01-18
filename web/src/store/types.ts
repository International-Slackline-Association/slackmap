import { Action, Reducer } from '@reduxjs/toolkit';
import type { AppState } from 'app/slices/app/types';

type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];

export type RequiredRootState = Required<RootState>;

export type RootStateKeyType = keyof RootState;

export type InjectedReducersType = {
  [P in OptionalKeys<RootState>]?: Reducer<RequiredRootState[P], Action>;
};

export type StaticReducersType = {
  [P in RequiredKeys<RootState>]: Reducer<RootState[P], Action>;
};

export interface RootState {
  api: any;
  isaAccountApi: any;
  app?: AppState;
}
