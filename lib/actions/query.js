import actionTypes from './types';
import request from '../helpers/request';

export default function graphql ({query, variables}, fragments, connectors, config) {
  return (dispatch, getState) => {
    const {headers, endpoint} = getState().relateReducer;
    return request({
      dispatch,
      type: actionTypes.query,
      query,
      variables,
      connectors,
      fragments,
      headers: config && config.headers || headers,
      endpoint: config && config.endpoint || endpoint
    });
  };
}
