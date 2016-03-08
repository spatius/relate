import expect from 'expect';

import store from '../../lib/reducer/store';
import {Connectors} from '../../lib/reducer/connectors';

describe('Connectors store', () => {
  it('Starts an empty connectors object', () => {
    const connectors = new Connectors();
    expect(connectors.connectors).toEqual({});
  });

  const connectors = new Connectors();

  it('Adds a single connector from data added', () => {
    connectors.processConnectors(
      {
        connector1: {
          fragments: {
            pages: {
              _id: 1,
              title: 1
            }
          },
          mutations: {
            pages: {
              addPage: 'Some'
            }
          }
        },
        connectorX: { // shouldn't be added
          fragments: {
            else: {
              _id: 1,
              title: 1
            }
          }
        }
      },
      'pages',
      'a',
      ['a', 'b']
    );
    expect(connectors.connectors).toEqual({
      connector1: {
        data: {
          pages: 'a'
        },
        listens: {
          pages: ['a', 'b']
        },
        mutations: {
          pages: {
            addPage: 'Some'
          }
        }
      }
    });
  });

  it('Adds connector with array data', () => {
    connectors.processConnectors(
      {
        connector2: {
          fragments: {
            pages: {
              _id: 1,
              title: 1
            }
          }
        }
      },
      'pages',
      ['a', 'b'],
      ['a', 'b', 'c']
    );
    expect(connectors.connectors).toEqual({
      connector1: {
        data: {
          pages: 'a'
        },
        listens: {
          pages: ['a', 'b']
        },
        mutations: {
          pages: {
            addPage: 'Some'
          }
        }
      },
      connector2: {
        data: {
          pages: ['a', 'b']
        },
        listens: {
          pages: ['a', 'b', 'c']
        },
        mutations: {}
      }
    });
  });

  it('Deletes connector', () => {
    connectors.deleteConnector('connector1');
    expect(connectors.connectors).toEqual({
      connector2: {
        data: {
          pages: ['a', 'b']
        },
        listens: {
          pages: ['a', 'b', 'c']
        },
        mutations: {}
      }
    });
  });

  it('Updates connector', () => {
    connectors.processConnectors(
      {
        connector2: {
          fragments: {
            page: {
              _id: 1,
              title: 1
            }
          },
          mutations: {
            page: {
              something: 'something'
            }
          }
        }
      },
      'page',
      'd',
      ['d']
    );
    expect(connectors.connectors).toEqual({
      connector2: {
        data: {
          pages: ['a', 'b'],
          page: 'd'
        },
        listens: {
          pages: ['a', 'b', 'c'],
          page: ['d']
        },
        mutations: {
          page: {
            something: 'something'
          }
        }
      }
    });
    connectors.processConnectors(
      {
        connector2: {
          fragments: {
            pages: {
              _id: 1,
              title: 1
            }
          },
          mutations: {
            page: {
              something: 'something else'
            }
          }
        }
      },
      'pages',
      ['d', 'e', 'f'],
      ['d', 'e', 'f', 'g']
    );
    expect(connectors.connectors).toEqual({
      connector2: {
        data: {
          pages: ['d', 'e', 'f'],
          page: 'd'
        },
        listens: {
          pages: ['d', 'e', 'f', 'g'],
          page: ['d']
        },
        mutations: {
          page: {
            something: 'something else'
          }
        }
      }
    });
  });

  it('Generates data for connector', () => {
    store.db = {
      a: {
        _id: 'a',
        title: 'A'
      },
      b: {
        _id: 'b',
        title: 'B'
      }
    };

    connectors.connectors = {
      connector1: {
        data: {
          pages: ['a', 'b'],
          page: 'a'
        }
      }
    };

    expect(connectors.generateConnectorData('connector1')).toEqual({
      pages: [
        {
          _id: 'a',
          title: 'A'
        },
        {
          _id: 'b',
          title: 'B'
        }
      ],
      page: {
        _id: 'a',
        title: 'A'
      }
    });

    // Clean up
    store.db = {};
  });

  it('Gets connectors to update', () => {
    connectors.connectors = {
      connector1: {
        listens: {
          pages: ['a', 'b'],
          page: ['a']
        }
      },
      connector2: {
        listens: {
          pages: ['a', 'c']
        }
      }
    };

    expect(connectors.getConnectorsToUpdate(['a'])).toEqual(['connector1', 'connector2']);
    expect(connectors.getConnectorsToUpdate(['a'], ['connector1'])).toEqual(['connector2']);
    expect(connectors.getConnectorsToUpdate(['c'])).toEqual(['connector2']);
    expect(connectors.getConnectorsToUpdate(['b'])).toEqual(['connector1']);
    expect(connectors.getConnectorsToUpdate(['a'], ['connector1', 'connector2'])).toEqual([]);
  });

  it('Removes node and returns connectors to update', () => {
    connectors.connectors = {
      connector1: {
        data: {
          pages: ['a', 'b'],
          page: 'a'
        },
        listens: {
          pages: ['a', 'b'],
          page: ['a']
        }
      },
      connector2: {
        data: {
          pages: ['a', 'c']
        },
        listens: {
          pages: ['a', 'c', 'd']
        }
      }
    };

    expect(connectors.removeNode('a')).toEqual(['connector1', 'connector2']);
    expect(connectors.connectors).toEqual({
      connector1: {
        data: {
          pages: ['b'],
          page: null
        },
        listens: {
          pages: ['b'],
          page: []
        }
      },
      connector2: {
        data: {
          pages: ['c']
        },
        listens: {
          pages: ['c', 'd']
        }
      }
    });

    expect(connectors.removeNode('d')).toEqual(['connector2']);
    expect(connectors.connectors).toEqual({
      connector1: {
        data: {
          pages: ['b'],
          page: null
        },
        listens: {
          pages: ['b'],
          page: []
        }
      },
      connector2: {
        data: {
          pages: ['c']
        },
        listens: {
          pages: ['c']
        }
      }
    });
  });

  it('Alter connectors listening for a mutation', () => {
    connectors.connectors = {
      connector1: {
        data: {
          pages: ['a', 'b'],
          page: 'a'
        },
        listens: {
          pages: ['a', 'b'],
          page: ['a']
        },
        mutations: {
          addPage: [
            {
              type: 'APPEND',
              field: 'pages'
            }
          ]
        }
      },
      connector2: {
        data: {
          pages: {
            items: ['a', 'b'],
            count: 2
          }
        },
        listens: {
          pages: ['a', 'b', 'c', 'd']
        },
        mutations: {
          addPage: [
            {
              type: 'APPEND',
              field: ['pages', 'items']
            },
            {
              type: 'INCREMENT',
              field: ['pages', 'count']
            }
          ]
        }
      }
    };

    const toUpdate = connectors.checkMutationListeners(
      'addPage',
      'e',
      ['e', 'f']
    );

    expect(toUpdate).toEqual(['connector1', 'connector2']);
    expect(connectors.connectors).toEqual({
      connector1: {
        data: {
          pages: ['a', 'b', 'e'],
          page: 'a'
        },
        listens: {
          pages: ['a', 'b', 'e', 'f'],
          page: ['a']
        },
        mutations: {
          addPage: [
            {
              type: 'APPEND',
              field: 'pages'
            }
          ]
        }
      },
      connector2: {
        data: {
          pages: {
            items: ['a', 'b', 'e'],
            count: 3
          }
        },
        listens: {
          pages: ['a', 'b', 'c', 'd', 'e', 'f']
        },
        mutations: {
          addPage: [
            {
              type: 'APPEND',
              field: ['pages', 'items']
            },
            {
              type: 'INCREMENT',
              field: ['pages', 'count']
            }
          ]
        }
      }
    });
  });
});
