import request from 'superagent';
import Q from 'q';

export default function doRequest (body) {
  const {dispatch, query, variables, type, settings, ...params} = body;
    
  return new Q()
    .then(() => {
      const deferred = Q.defer();
      var promise = deferred.promise;

      const req = request
        .post(settings.endpoint)
        .set(settings.headers)
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
