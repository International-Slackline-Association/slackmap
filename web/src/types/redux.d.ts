import * as Redux from 'redux';

declare module 'redux' {
  export interface Store {
    injectReducer: (key: string, reducer: Redux.Reducer<any, AnyAction>) => void;
    injectedReducers: { [key: string]: Redux.Reducer<any, AnyAction> };
  }
}
