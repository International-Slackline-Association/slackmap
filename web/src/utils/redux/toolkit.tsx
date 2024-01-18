import {
  CreateSliceOptions,
  SliceCaseReducers,
  createSlice as createSliceOriginal,
} from '@reduxjs/toolkit';
import { RootStateKeyType } from 'store/types';

/* Wrap createSlice with stricter Name options */

/* istanbul ignore next */
export const createSlice = <
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends RootStateKeyType,
>(
  options: CreateSliceOptions<State, CaseReducers, Name>,
) => {
  return createSliceOriginal(options);
};
