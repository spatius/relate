import forEach from 'lodash.foreach';
import union from 'lodash.union';
import warning from 'warning';

import actionTypes from '../actions/types';
import connectors from './connectors';
import processNode from './process-node';
import store from './store';

// Default state
// state will be composed of connectors data, e.g.
// {
//   connector_1: {
//     pages: [{...}, {...}]
//   },
//   connector_2: {
//     page: {...}
//   }
// }
const defaultState = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  endpoint: '/graphql'
};

function removeAction ({node, queryName}) {
  let connectorsToUpdate = [];

  if (node._id) {
    // Remove from store
    store.removeNode(node._id);

    // Remove from connectors
    connectorsToUpdate = connectors.removeNode(node._id);

    // Check connectors listening to this mutation
    connectorsToUpdate = union(
      connectorsToUpdate,
      connectors.checkMutationListeners(queryName, [], [])
    );
  }

  return connectorsToUpdate;
}

export function relateReducer (state = defaultState, action = {}) {
  if ((action.type === actionTypes.query || action.type === actionTypes.mutation) &&
      action.data &&
      action.fragments) {
    const isMutation = action.type === actionTypes.mutation;
    const isRemoveMutation = isMutation && action.mutationType === 'REMOVE';
    let connectorsToUpdate = action.connectors && Object.keys(action.connectors) || [];
    let nodes = [];

    if (isRemoveMutation) {
      forEach(action.fragments, (fragment, queryName) => {
        if (fragment._id) {
          const queryData = action.data[queryName];

          if (queryData && queryData.constructor === Array) {
            forEach(queryData, (queryDataItem) => {
              connectorsToUpdate = union(
                connectorsToUpdate,
                removeAction({
                  node: queryDataItem,
                  queryName
                })
              );
            });
          } else if (queryData && queryData._id) {
            connectorsToUpdate = union(
              connectorsToUpdate,
              removeAction({
                node: queryData,
                queryName
              })
            );
          } else {
            warning(false, 'RELATE: Remove action failed');
            // TODO handle error in some way?
          }
        }
      });
    } else {
      forEach(action.fragments, (fragment, _queryName) => {
        const queryName =
          _queryName.indexOf(':') !== -1 ?
          _queryName.split(':')[0] :
          _queryName;

        const nodesProcessed = processNode(
          action.data[queryName],
          fragment
        ); // { relativeNodes: [], nodes: [], changes: {} }

        // DB changes
        store.updateNodes(nodesProcessed.changes);

        // Save nodes changed to later check which connectors to update
        nodes = union(nodes, nodesProcessed.nodes);

        // Check if is mutation and brings a mutates field
        if (isMutation && action.mutates) {
          nodes = union(
            nodes,
            store.performUserMutate(action.mutates, nodesProcessed.relativeNodes)
          );
        }

        // Connectors
        if (action.connectors) {
          connectors.processConnectors(
            action.connectors,
            queryName,
            nodesProcessed.relativeNodes,
            nodesProcessed.nodes
          );
        }

        // Mutations
        if (isMutation) {
          connectorsToUpdate = union(
            connectorsToUpdate,
            connectors.checkMutationListeners(queryName, nodesProcessed.relativeNodes, nodesProcessed.nodes)
          );
        }
      });
    }

    // Check more connectors than need to update
    connectorsToUpdate = connectorsToUpdate.concat(
      connectors.getConnectorsToUpdate(nodes, connectorsToUpdate)
    );

    // Calculate connectors data
    const changes = {};
    forEach(connectorsToUpdate, (connectorId) => {
      if (connectors.connectorExists(connectorId)) {
        changes[connectorId] = connectors.generateConnectorData(connectorId);
      }
    });

    return Object.assign({}, state, changes);
  }

  if (action.type === actionTypes.removeConnector) {
    const newState = Object.assign({}, state);
    delete newState[action.id];
    connectors.deleteConnector(action.id);
    // TODO Delete no longer needed data from state? or maintain for future cache?
    return newState;
  }

  if (action.type === actionTypes.setHeader) {
    return Object.assign({}, state, {
      headers: Object.assign({}, state.headers, {
        [action.key]: action.value
      })
    });
  }

  if (action.type === actionTypes.removeHeader) {
    const headers = Object.assign({}, state.headers);
    delete headers[action.key];
    return Object.assign({}, state, {
      headers
    });
  }

  if (action.type === actionTypes.setEndpoint) {
    return Object.assign({}, state, {
      endpoint: action.endpoint
    });
  }

  return state;
}

export function relateReducerInit (settings) {
  Object.assign(defaultState, settings);
  return relateReducer;
}
