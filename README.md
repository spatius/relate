Relate is an extension of the redux connect which resolves your data needs automatically and provides it to your wrapped component. **This lib is still in progress and contributors are definitely welcome**.

Relate follows a similar API to [Relay](https://github.com/facebook/relay), this project isn't supposed to replace Relay but is more an alternative to it. The main difference between them are:

* Relate is agnostic to your schema, which means you don't have to alter your schemas to use it.
* Relate uses [Redux](https://github.com/reactjs/redux) and extends [React Redux](https://github.com/reactjs/react-redux), if you use these techs in your project already, it'll be a perfect fit.
* Since it uses Redux you can capture queries and mutations in other reducers and process them in other ways.
* Fragments are not specified as GraphQL notation but as a plain object.
* Server side rendering (In progress)

## Here's How it Works

```js
@dataConnect(
  (state) => ({
    // The data you want from the redux store
    // same as in react redux connect
  }),
  (dispatch) => ({
    // Your dispatch binds
    // same as in react redux connect
  }),
  (props) => {
    return {
      fragments: {
        pages: {
          _id: 1,
          title: 1,
          user: {
            _id: 1,
            username: 1
          }
        }
      }
    };
  }
)
export default class PagesContainer extends Component {
  render () {
    ...
  }
}
```

Basically `dataConnect` is an extension of the `connect` from React Redux, where the last argument will be relative to Relate. There you can specify the data you want from your server by specifying the fragments. In this case we're specifying we want `pages`.

What Relate will do is group all your `dataConnect` data requirements, and make a single request with your app data needs. Following this case, it would request the following from your server:

```js
{
  query: `
    query {
      pages {
        _id,
        title
      }
    }
  `,
  variables: {}
}
```

Let's suppose the data fetched would be:

```js
{
  pages: [
    {
      _id: 'page1',
      title: 'Page 1',
      user: {
        _id: 'userX',
        username: 'User X'
      }
    },
    {
      _id: 'page2',
      title: 'Page 2',
      user: {
        _id: 'userX',
        username: 'User X'
      }
    }
  ]
}
```

Relate will check for nodes with `_id`s, flat them and store in an object. Something like this:

```js
{
  page1: {
    _id: 'page1',
    title: 'Page 1',
    user: Link('userX')
  },
  page2: {
    _id: 'page2',
    title: 'Page 2',
    user: Link('userX')
  },
  userX: {
    _id: 'userX',
    username: 'User X'
  }
}
```

It will then check what the connector actually needs and build it to the Redux store. So `PagesContainer` will receive the following as props:

```js
{
  pages: [
    {
      _id: 'page1',
      title: 'Page 1',
      user: {
        _id: 'userX',
        username: 'User X'
      }
    },
    {
      _id: 'page2',
      title: 'Page 2',
      user: {
        _id: 'userX',
        username: 'User X'
      }
    }
  ]
}
```

If some update is made to the node `userX` this connector's data will update to reflect that. Same goes for `page1` and `page2`. This makes your data consistent throughout your app without you having to worry about it.

You can also specify variables in the dataConnect:

```js
@dataConnect(
  (state) => ({
    // The data you want from the redux store
    // same as in react redux connect
  }),
  (dispatch) => ({
    // Your dispatch binds
    // same as in react redux connect
  }),
  (props) => {
    return {
      fragments: {
        pages: {
          _id: 1,
          title: 1,
          user: {
            _id: 1,
            username: 1
          }
        }
      },
      variablesTypes: {
        pages: {
          sort: 'String',
          order: 'String'
        }
      },
      initialVariables: {
        pages: {
          sort: props.sort,
          order: props.order
        }
      },
    };
  }
)
export default class PagesContainer extends Component {
  componentWillReceiveProps (nextProps) {
    if (nextProps.sort !== this.props.sort || nextProps.order !== this.props.order) {
      this.props.relate.setVariables({
        pages: {
          sort: nextProps.sort,
          order: nextProps.order
        }
      });
    }
  }

  render () {
    ...
  }
}
```

Pretty similar to Relay's api. You can use props to build your initial variables which you can get from Redux's store or by passing them to the container. By later calling `setVariables`, Relate will fetch the data with the new variables. You don't have to worry about variables names colliding with other queries, it is all handled by Relate.
