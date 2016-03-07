import forEach from 'lodash.foreach';
import merge from 'lodash.merge';
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
const defaultState = {};

export default function graphqlReducer (state = defaultState, action = {}) {
  if ((action.type === actionTypes.query || action.type === actionTypes.mutation) && action.data && action.fragments) {
    const isMutation = action.type === actionTypes.mutation;
    const isRemoveMutation = isMutation && action.mutationType === 'REMOVE';
    let connectorsToUpdate = action.connectors && Object.keys(action.connectors) || [];
    let nodes = [];

    if (isRemoveMutation) {
      forEach(action.fragments, (fragment, queryName) => {
        if (fragment._id) {
          const queryData = action.data[queryName];
          if (queryData && queryData._id) {
            // Remove from store
            store.removeNode(queryData._id);

            // Remove from connectors
            connectorsToUpdate = connectors.removeNode(queryData._id);
          } else {
            warning(false, 'RELATE: Remove action failed');
            // TODO handle error in some way?
          }
        }
      });
    } else {
      forEach(action.fragments, (fragment, queryName) => {
        const nodesProcessed = processNode(action.data[queryName], fragment, queryName); // { relativeNodes: [], nodes: [], changes: {} }

        // DB changes
        store.updateNodes(nodesProcessed.changes);

        // Save nodes changed to later check which connectors to update
        nodes = union(nodes, nodesProcessed.nodes);

        // Connectors
        if (action.connectors) {
          connectors.processConnectors(action.connectors, queryName, nodesProcessed.relativeNodes, nodesProcessed.nodes);
        }
      });
    }

    // Check more connectors than need to update
    connectorsToUpdate = connectorsToUpdate.concat(connectors.getConnectorsToUpdate(nodes, connectorsToUpdate));

    // Calculate connectors data
    const changes = {};
    forEach(connectorsToUpdate, (connectorId) => {
      changes[connectorId] = connectors.generateConnectorData(connectorId);
    });

    return merge({}, state, changes);

    //   // Save data map for connectors
    //   const connectors = action.params && action.params.connectors;
    //   if (connectors) {
    //     forEach(connectors, (connectorQuery, connectorId) => {
    //       // check if current graphql action was triggered by the current connector
    //       if (connectorQuery.fragments[graphAction]) {
    //         Object.assign(changes, {
    //           [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //             [graphAction]: connectorData
    //           })
    //         });
    //       }
    //       // Add info to connectorsListeners if appliable
    //       connectorsListeners[connectorId] = connectorQuery.mutations;
    //     });
    //   } else {
    //     // Is a mutation
    //     if (action.params && action.params.remove) {
    //       // remove
    //       const connectorsIds = Object.keys(connectorsListeners);
    //       forEach(connectorsIds, (connectorId) => {
    //         const connectorState = state[connectorId];
    //         forEach(connectorState, (values, query) => {
    //           if (values && values.constructor === Array) {
    //             const index = values.indexOf(connectorData);
    //             if (index !== -1) {
    //               const newConnectorValues = values.slice(0);
    //               newConnectorValues.splice(index, 1);
    //               Object.assign(changes, {
    //                 [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //                   [query]: newConnectorValues
    //                 })
    //               });
    //             }
    //           }
    //         });
    //       });
    //     } else {
    //       // add or update
    //       forEach(connectorsListeners, (queries, connectorId) => {
    //         if (queries) {
    //           forEach(queries, (mutations, queryName) => {
    //             if (mutations[graphAction]) {
    //               const connectorMutationAction = mutations[graphAction];
    //               const connectorQueryData = state[connectorId][queryName];
    //               const arrayConnectorData = connectorData.constructor === Array ? connectorData : [connectorData];
    //
    //               if (connectorMutationAction === 'prepend') {
    //                 Object.assign(changes, {
    //                   [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //                     [queryName]: [...arrayConnectorData, ...connectorQueryData]
    //                   })
    //                 });
    //               } else if (connectorMutationAction === 'append') {
    //                 Object.assign(changes, {
    //                   [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //                     [queryName]: [...connectorQueryData, ...arrayConnectorData]
    //                   })
    //                 });
    //               }
    //             }
    //           });
    //         }
    //       });
    //     }
    //   }
    // });
    //
    // return Object.assign({}, state, changes);
  }

  if (action.type === actionTypes.removeConnector) {
    const newState = Object.assign({}, state);
    delete newState[action.id];
    connectors.deleteConnector(action.id);
    // TODO Delete no longer needed data from state? or maintain for future cache?
    return newState;
  }

  return state;
}
