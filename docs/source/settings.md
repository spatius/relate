---
layout: default
id: settings
title: Set headers or endpoint
prev: intersect.html
---

It is often necessary to set additional headers on the graphql requests, and Relate allows you to
modify these using standard Redux actions from anywhere in your application.

Here's an example of setting an authorization header (for example, setting a bearer token after successfully logging in).

```js
import { setHeader } from 'relate-js'

dispatch(setHeader('Authorization', 'Bearer 123456'))
```

If no longer needed, a header can be removed:

```js
import { removeHeader } from 'relate-js'

dispatch(removeHeader('Authorization', 'Bearer 123456'))
```

The default headers, which can be overridden using the above method, are:

```js
Content-Type: 'application/json'
Accept: 'application/json'
```

Setting the endpoint
By default Relate will attempt to post to '/graphql'. This can be changed using the setEndpoint action.

```js
import { setEndpoint } from 'relate-js'
dispatch(setEndpoint('/different-graphql-endpoint'))
```

Initial Settings
These settings can also be modified in your application's initial state, avoiding the need to dispatch any actions.

```js
const initialState = {
  relateReducer: {
    settings: {
      'x-important-header':'foo'
    }
  }
}

const store = configureStore(intialState)
```
