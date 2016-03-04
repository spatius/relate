import actionTypes from './types';

export function removeConnector (id) {
  return {
    type: actionTypes.removeConnector,
    id
  };
}
