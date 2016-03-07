import expect from 'expect';

import Link from '../../lib/reducer/link';
import {Store} from '../../lib/reducer/store';

describe('Store', () => {
  it('Starts an empty db object', () => {
    const store = new Store();
    expect(store.db).toEqual({});
  });

  const store = new Store();

  it('Adds a single node', () => {
    store.updateNodes({
      a: {
        _id: 'a',
        title: 'something'
      }
    });
    expect(store.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      }
    });
  });

  it('Adds more nodes', () => {
    store.updateNodes({
      b: {
        _id: 'b',
        title: 'something B'
      },
      c: {
        _id: 'c',
        title: 'something C'
      }
    });
    expect(store.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something B'
      },
      c: {
        _id: 'c',
        title: 'something C'
      }
    });
  });

  it('Makes changes to nodes', () => {
    store.updateNodes({
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      }
    });
    expect(store.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      }
    });
  });

  it('Adds nodes with nested structures', () => {
    store.updateNodes({
      d: {
        _id: 'd',
        title: 'something about D',
        nested: {
          something: 'nice'
        }
      }
    });
    expect(store.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      },
      d: {
        _id: 'd',
        title: 'something about D',
        nested: {
          something: 'nice'
        }
      }
    });
  });

  it('Updates nodes with nested structures', () => {
    store.updateNodes({
      d: {
        _id: 'd',
        nested: {
          changing: 'cool'
        }
      }
    });
    expect(store.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      },
      d: {
        _id: 'd',
        title: 'something about D',
        nested: {
          something: 'nice',
          changing: 'cool'
        }
      }
    });
  });

  it('Gets single node data', () => {
    const data = store.getData('a');
    expect(data).toEqual({
      _id: 'a',
      title: 'something'
    });
  });

  it('Gets array of nodes', () => {
    const data = store.getData(['a', 'b']);
    expect(data).toEqual([
      {
        _id: 'a',
        title: 'something'
      },
      {
        _id: 'b',
        title: 'something about B'
      }
    ]);
  });

  it('Gets nested node', () => {
    const data = store.getData({item: 'a'});
    expect(data).toEqual({
      item: {
        _id: 'a',
        title: 'something'
      }
    });
  });

  it('Gets nested array of node', () => {
    const data = store.getData({item: ['a', 'b']});
    expect(data).toEqual({
      item: [
        {
          _id: 'a',
          title: 'something'
        },
        {
          _id: 'b',
          title: 'something about B'
        }
      ]
    });
  });

  it('Adds nodes with Link nodes', () => {
    // Clean up
    store.db = {};

    store.updateNodes({
      a: {
        _id: 'a',
        title: 'A'
      },
      b: {
        _id: 'b',
        title: 'B',
        linked: new Link('a')
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: new Link(['a', 'b'])
      }
    });
    expect(store.db).toEqual({
      a: {
        _id: 'a',
        title: 'A'
      },
      b: {
        _id: 'b',
        title: 'B',
        linked: new Link('a')
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: new Link(['a', 'b'])
      }
    });
  });

  it('Gets data node with a Link', () => {
    const data = store.getData('b');
    expect(data).toEqual({
      _id: 'b',
      title: 'B',
      linked: {
        _id: 'a',
        title: 'A'
      }
    });
  });

  it('Gets data node with array of Links', () => {
    const data = store.getData('c');
    expect(data).toEqual({
      _id: 'c',
      title: 'C',
      linked: [
        {
          _id: 'a',
          title: 'A'
        },
        {
          _id: 'b',
          title: 'B',
          linked: {
            _id: 'a',
            title: 'A'
          }
        }
      ]
    });
  });

  it('Removes node', () => {
    // Clean up
    store.db = {};

    store.updateNodes({
      a: {
        _id: 'a',
        title: 'A'
      },
      b: {
        _id: 'b',
        title: 'B',
        linked: new Link('a')
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: new Link(['a', 'b'])
      }
    });
    store.removeNode('a');
    expect(store.db).toEqual({
      b: {
        _id: 'b',
        title: 'B',
        linked: new Link('a')
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: new Link(['a', 'b'])
      }
    });
    store.removeNode('b');
    expect(store.db).toEqual({
      c: {
        _id: 'c',
        title: 'C',
        linked: new Link(['a', 'b'])
      }
    });
  });
});
