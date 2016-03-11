import expect from 'expect';

import Relate, {
  dataConnect,
  rootDataConnect,
  relateReducer,
  actionTypes,
  mutation,
  mergeFragments
} from '../lib';

describe('Relate', () => {
  it('Exposes public interface', () => {
    expect(Relate).toBeAn(Object);
    expect(Relate).toEqual({
      dataConnect,
      rootDataConnect,
      relateReducer,
      actionTypes,
      mutation,
      mergeFragments
    });
  });
});
