import actionTypes from './types';

export function setHeader(key, value) {
  return {
    type: actionTypes.setHeader,
    key,
    value
  };
}

export function removeHeader(key) {
  return {
<<<<<<< HEAD
<<<<<<< HEAD
    type: actionTypes.removeHeader,
=======
    type: actionTypes.setHeader,
>>>>>>> refs/remotes/origin/master
=======
    type: actionTypes.setHeader,
>>>>>>> b541b2c69c85fba29d53016346a80517957c28f2
    key
  };
}

export function setEndpoint(endpoint) {
  return {
    type: actionTypes.setEndpoint,
    endpoint
  };
}