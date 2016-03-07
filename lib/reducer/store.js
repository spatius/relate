import forEach from 'lodash.forEach';
import merge from 'lodash.merge';

import Link from './link';

// The store is responsible for holding and managing data
export class Store {
  constructor () {
    // Local database
    // composed of data nodes, e.g.
    // {
    //   56d0583eb0dc646f07b05cf2: {...},
    //   568fc7d152e76bc604a74520: {...}
    // }
    this.db = {};
  }

  updateNodes (changes) {
    merge(this.db, changes);
  }

  getData (data) {
    const isList = data && data.constructor === Array;
    const isId = typeof data === 'string';
    const isObject = typeof data === 'object';
    const isLink = data && data.constructor === Link;
    let result;

    if (isLink) {
      result = this.getData(data.get());
    } else if (isList) {
      result = [];
      forEach(data, (piece) => {
        result.push(this.getData(piece));
      });
    } else if (isId) {
      result = this.db[data] || data;
    } else if (isObject) {
      result = {};
      forEach(data, (piece, pieceName) => {
        result[pieceName] = this.getData(piece);
      });
    } else {
      result = data;
    }

    return result;
  }

  getDB () {
    return this.db;
  }
}

export default new Store();
