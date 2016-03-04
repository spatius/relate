import actionTypes from './types';
import request from '../helpers/request';

export default function graphql ({query, variables}, connectors) {
  return (dispatch) => {
    return request({
      dispatch,
      type: actionTypes.query,
      query,
      variables,
      params: {
        connectors
      }
    });
  };
}
