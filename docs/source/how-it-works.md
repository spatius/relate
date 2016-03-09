---
layout: default
id: how-it-works
title: How it works
prev: index.html
next: requirements.html
---

Relate has three main parts:

* Data connectors - are an extension of the React Redux connect, and serve to

Relate is agnostic to your data schema. For this to work Relate presumes your schema models have an ID associated, it will search data received from requests and check for nodes which have an ID associated. For example, when receiving the following data from a query:

```js
{
  pages: [
    {
      _id: 'a',
      title: 'A',
      user: {
        _id: 'user',
        username: 'User'
      }
    },
    {
      _id: 'b',
      title: 'B'
    }
  ],
  page: {
    _id: 'c',
    title: 'C'
  },
  pagesAnotherWay: {
    items: [
      {
        _id: 'b',
        title: 'B'
      },
      {
        _id: 'd',
        title: 'D'
      }
    ],
    pagesCount: 2
  }
}
```

Relate will check which nodes comes in the request and normalize them into a private store. Following the above example the store will have the following:

```js
{
  a: {
    _id: 'a',
    title: 'A',
    user: Link('user')
  },
  user: {
    _id: 'user',
    username: 'User'
  },
  b: {
    _id: 'b',
    title: 'B'
  },
  c: {
    _id: 'c',
    title: 'C'
  },
  d: {
    _id: 'd',
    title: 'D'
  }
}
```

Note how even nested structures are normalized into the store. Pretty neat!

**But how do we use this data in our React components and how do we declare which data we need in each component and how is it served to it?**
