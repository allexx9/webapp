// Copyright 2016-2017 Rigo Investment Sarl.

import { combineEpics } from 'redux-observable';
import pingEpic from './ping';

export const rootEpic = combineEpics(
  pingEpic,
);