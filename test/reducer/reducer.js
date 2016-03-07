import expect from 'expect';

import {reducer, actionTypes} from '../../lib';

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

  it('State returns connectors data from what was requested', () => {
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
      },
      connectors: {
        connector1: {
          fragments: {
            pages: {
              _id: 1,
              title: 1
            }
          }
        },
        connector2: {
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
        }
      }
    });
    expect(newState).toNotBe(state);
    expect(newState).toEqual({
      connector1: {
        pages: [
          {
            _id: 'a',
            title: 'some'
          },
          {
            _id: 'b',
            title: 'another'
          }
        ]
      },
      connector2: {
        pages: [
          {
            _id: 'a',
            title: 'some'
          },
          {
            _id: 'b',
            title: 'another'
          }
        ],
        page: {_id: 'c', title: 'other'}
      }
    });
  });
});
