import expect from 'expect';

import Relate, {
  dataConnect,
  rootDataConnect,
  reducer,
  actionTypes,
  mutation
} from '../lib';

describe('Relate', () => {
  it('Exposes public interface', () => {
    expect(Relate).toBeAn(Object);
    expect(Relate).toEqual({
      dataConnect,
      rootDataConnect,
      reducer,
      actionTypes,
      mutation
    });
  });
});
