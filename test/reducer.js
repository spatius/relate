import expect from 'expect';

import Link from '../lib/reducer/link';
import {reducer, actionTypes} from '../lib';

describe('Reducer', () => {
  it('Does not alter state if not a Relate action', () => {
    const state = {something: 1};
    const newState = reducer(state, {type: 'not'});
    expect(newState).toBe(state);
    expect(newState).toEqual(state);
  });

  it('Does not alter state if query action does not have data or fragments', () => {
    const state = {something: 1};
    const newState = reducer(state, {type: actionTypes.query});
    const newState1 = reducer(state, {type: actionTypes.query, data: {}});
    expect(newState).toBe(state);
    expect(newState).toEqual(state);
    expect(newState1).toBe(state);
    expect(newState1).toEqual(state);
  });

  it('Adds nodes from data received', () => {
    const state = {};
    const newState = reducer(state, {
      type: actionTypes.query,
      data: {
        pages: [{_id: 'a', title: 'some'}, {_id: 'b', title: 'another'}],
        page: {_id: 'c', title: 'other'}
      },
      fragments: {
        pages: {
          _id: 1,
          title: 1
        },
        page: {
          _id: 1,
          title: 1
        }
      }
    });
    expect(newState).toNotBe(state);
    expect(newState).toEqual({
      a: {
        _id: 'a',
        title: 'some'
      },
      b: {
        _id: 'b',
        title: 'another'
      },
      c: {
        _id: 'c',
        title: 'other'
      }
    });
  });

  it('Adds root queries values with query name', () => {
    const state = {};
    const newState = reducer(state, {
      type: actionTypes.query,
      data: {
        pagesCount: 20,
        noId: {
          something: 'something nice'
        }
      },
      fragments: {
        pagesCount: 1,
        noId: {
          something: 1
        }
      }
    });
    expect(newState).toNotBe(state);
    expect(newState).toEqual({
      pagesCount: 20,
      noId: {
        something: 'something nice'
      }
    });
  });

  it('Adds nested nodes in query from data received', () => {
    const state = {};
    const newState = reducer(state, {
      type: actionTypes.query,
      data: {
        pages: {
          items: [{_id: 'a', title: 'some'}, {_id: 'b', title: 'another'}],
          count: 2
        }
      },
      fragments: {
        pages: {
          items: {
            _id: 1,
            title: 1
          },
          count: 1
        }
      }
    });
    expect(newState).toNotBe(state);
    expect(newState).toEqual({
      a: {
        _id: 'a',
        title: 'some'
      },
      b: {
        _id: 'b',
        title: 'another'
      },
      pages: {
        items: new Link(['a', 'b']),
        count: 2
      }
    });
  });
});
