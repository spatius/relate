import request from 'superagent';
import Q from 'q';

export default function doRequest (body) {
  const {dispatch, query, variables, type, settings, ...params} = body;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  
  const headers = Object.assign({}, defaultHeaders, settings.headers)
  
  return new Q()
    .then(() => {
      const deferred = Q.defer();
      let promise = deferred.promise;

      const req = request
<<<<<<< HEAD
        .post(settings.endpoint)
        .set(settings.headers)
=======
        .post(settings.endpoint || '/graphql')
        .set(headers)
>>>>>>> b541b2c69c85fba29d53016346a80517957c28f2
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
