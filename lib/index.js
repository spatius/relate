import {mergeFragments} from 'relax-fragments';

import actionTypes from './actions/types';
import dataConnect from './decorators/data-connect';
import mutation from './actions/mutation';
import relateReducer from './reducer/reducer';
import rootDataConnect from './decorators/root-data-connect';

export {
  dataConnect,
  rootDataConnect,
  relateReducer,
  actionTypes,
  mutation,
  mergeFragments
};

export default {
  dataConnect,
  rootDataConnect,
  relateReducer,
  actionTypes,
  mutation,
  mergeFragments
};
