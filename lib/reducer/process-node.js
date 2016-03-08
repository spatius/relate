import forEach from 'lodash.foreach';
import union from 'lodash.union';

import Link from './link';

function _handleSubNode (subNodes, data, fragment, result) {
  const resultData = Object.assign({}, data);
  forEach(subNodes, (property) => {
    const subNodeData = data[property];
    if (subNodeData) {
      const subNode = handleNode(subNodeData, fragment[property]);
      resultData[property] = new Link(subNode.relativeNodes);
      result.nodes = union(result.nodes, subNode.nodes);
      Object.assign(result.changes, subNode.changes);
    }
  });
  return resultData;
}

// Handler for a node input
// a node is a piece of data defined by a fragment
//
// Input:
//  data: data for this node, e.g
//  {
//     _id: '..',
//    title: '..',
//    user: {
//      _id: '..',
//      username: '..'
//    }
//  }
//  fragment: fragment of this node e.g
//  {
//    _id: 1,
//    title: 1,
//    user: {
//      _id: 1,
//      username: 1
//    }
//  }
//
// Outputs Object e.g
// {
//   relativeNodes: [#pageId, #pageId1],
//   nodes: [#pageId, #pageId1, #userId], // list of all nodes added
//   changes: {
//     #pageId: {
//       _id: '..',
//       title: '..',
//       user: Link(#userId)
//     },
//     #pageId1: {
//       _id: '..',
//       title: '..',
//       user: Link(#userId)
//     },
//     #userId: {
//       _id: '..',
//       username: '..'
//     }
//   }
// }
export default function handleNode (data, fragment, rootQueryName) {
  const isList = data && data.constructor === Array;
  const isNode = fragment._id && true;
  const result = {
    relativeNodes: null,
    nodes: [],
    changes: {}
  };

  // Check for aditional nodes inside this
  const subNodes = [];
  forEach(fragment, (value, key) => {
    if (typeof value === 'object' && value._id) {
      subNodes.push(key);
    }
  });

  if (isList) {
    result.relativeNodes = [];

    if (isNode) {
      // List of nodes
      forEach(data, (entryData) => {
        const ID = entryData._id;
        result.nodes.push(ID);
        result.relativeNodes.push(ID);

        if (subNodes.length > 0) {
          const resultData = _handleSubNode(subNodes, entryData, fragment, result);
          result.changes[ID] = resultData;
        } else {
          result.changes[ID] = entryData;
        }
      });
    } else {
      // Arbitrary structure list
      forEach(data, (entryData) => {
        if (subNodes.length > 0) {
          const resultData = _handleSubNode(subNodes, entryData, fragment, result);
          result.relativeNodes.push(resultData);
        } else {
          result.relativeNodes.push(entryData);
        }
      });
    }
  } else {
    if (isNode) {
      // Single node
      const ID = data._id;
      result.relativeNodes = ID;
      result.nodes.push(ID);

      if (subNodes.length > 0) {
        const resultData = _handleSubNode(subNodes, data, fragment, result);
        result.changes[ID] = resultData;
      } else {
        result.changes[ID] = data;
      }
    } else {
      // Arbitrary structure
      if (subNodes.length > 0) {
        const resultData = _handleSubNode(subNodes, data, fragment, result);
        result.relativeNodes = resultData;
      } else {
        result.relativeNodes = data;
      }
    }
  }

  return result;
}
