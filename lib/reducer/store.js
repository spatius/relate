import forEach from 'lodash.foreach';
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

  removeNode (id) {
    this.db[id] && delete this.db[id];
  }

  getData (data) {
    const isList = data && data.constructor === Array;
    const isId = data && typeof data !== 'object' && this.db[data];
    const isObject = data && typeof data === 'object';
    const isLink = data && data.constructor === Link;
    let result;

    if (isLink) {
      const linkData = data.get();
      if (linkData && linkData.constructor === Array) {
        result = [];
        forEach(linkData, (piece) => {
          result.push(this.getData(piece));
        });
      } else {
        result = this.getData(linkData);
      }
    } else if (isList) {
      result = [];
      forEach(data, (piece) => {
        result.push(this.getData(piece));
      });
    } else if (isId) {
      result = this.db[data];
      forEach(result, (piece, pieceName) => {
        if (piece && piece.constructor === Link) {
          result[pieceName] = this.getData(piece);
        }
      });
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
}

export default new Store();
