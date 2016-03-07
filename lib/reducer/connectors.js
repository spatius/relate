import forEach from 'lodash.foreach';
import merge from 'lodash.merge';

import store from './store';

export class Connectors {
  constructor () {
    // Connectors info
    // composed of connectors and their info, e.g
    // {
    //   connector_1: {
    //     data: {
    //       pages: ['56d0583eb0dc646f07b05cf2', '568fc7d152e76bc604a74520']
    //     },
    //     listens: {
    //       pages: ['56d0583eb0dc646f07b05cf2', '568fc7d152e76bc604a74520', ...]
    //     },
    //     mutations: {
    //       pages: {
    //         addPage: 'prepend'
    //       }
    //     }
    //   }
    // }
    this.connectors = {};
  }

  generateConnectorData (connectorId) {
    const connectorData = this.connectors[connectorId].data;
    const result = {};

    forEach(connectorData, (data, dataName) => {
      result[dataName] = store.getData(data);
    });

    return result;
  }

  // Process a query through the connectors that requested it
  processConnectors (queryConnectors, queryName, relativeNodes, nodes) {
    forEach(queryConnectors, (connectorQuery, connectorId) => {
      // check if query was triggered by this connector
      if (connectorQuery.fragments[queryName]) {
        if (this.connectors[connectorId]) {
          const conn = this.connectors[connectorId];
          Object.assign(conn.data, {
            [queryName]: relativeNodes
          });
          Object.assign(conn.listens, {
            [queryName]: nodes
          });
          conn.mutations = merge(conn.mutations, connectorQuery.mutations);
        } else {
          this.connectors[connectorId] = {
            data: {
              [queryName]: relativeNodes
            },
            listens: {
              [queryName]: nodes
            },
            mutations: connectorQuery.mutations
          };
        }
      }
    });
  }

  deleteConnector (connectorId) {
    this.connectors[connectorId] && delete this.connectors[connectorId];
  }
}

export default new Connectors();
