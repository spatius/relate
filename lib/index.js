import {mergeFragments} from 'relax-fragments';

import actionTypes from './actions/types';
import dataConnect from './decorators/data-connect';
import mutation from './actions/mutation';
import rootDataConnect from './decorators/root-data-connect';
import {setHeader, removeHeader, setEndpoint} from './actions/settings';
import {relateReducer, relateReducerInit} from './reducer/reducer';

export {
  dataConnect,
  rootDataConnect,
  relateReducer,
  relateReducerInit,
  actionTypes,
  mutation,
  mergeFragments,
  setHeader,
  removeHeader,
  setEndpoint
};

export default {
  dataConnect,
  rootDataConnect,
  relateReducer,
  relateReducerInit,
  actionTypes,
  mutation,
  mergeFragments,
  setHeader,
  removeHeader,
  setEndpoint
};
