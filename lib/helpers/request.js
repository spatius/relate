import request from 'superagent';
import Q from 'q';

export default function doRequest (body) {
  const {dispatch, query, variables, type, endpoint, headers, ...params} = body;

  return new Q()
    .then(() => {
      const deferred = Q.defer();
      let promise = deferred.promise;

      const req = request
        .post(endpoint || '/graphql')
        .set(headers)
        .send({query, variables});

      req
        .end((error, res) => {
          if (error) {
            deferred.reject(error);
          } else {
            deferred.resolve(res.body);
          }
        });

      if (dispatch) {
        promise = promise.then(({data, errors}) => {
          dispatch({type, data, errors, ...params});
          return data;
        });
      }

      return promise;
    });
}
