import actionTypes from './actions/types';
import dataConnect from './decorators/data-connect';
import reducer from './reducer/reducer';
import rootDataConnect from './decorators/root-data-connect';

export {
  dataConnect,
  rootDataConnect,
  reducer,
  actionTypes
};

export default {
  dataConnect,
  rootDataConnect,
  reducer,
  actionTypes
};
