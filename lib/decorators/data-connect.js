import forEach from 'lodash.foreach';
import hoistStatics from 'hoist-non-react-statics';
import invariant from 'invariant';
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import removeConnector from '../actions/remove-connector';

let ID_COUNTER = 0;

// getBundle is a function which receives the component props
// and retrieves a configuration set by the user
// e.g
// (props) => ({
//   fragments: {
//     pages: {
//       _id: 1,
//       title: 1
//     },
//     page: {
//       _id: 1,
//       title: 1,
//       user: {
//         _id: 1,
//         username: 1
//       }
//     }
//   },
//   variablesTypes: {
//     pages: {
//       order: 'String!',
//       sort: 'String!'
//     }
//   },
//   initialVariables: {
//     pages: {
//       order: 'asc',
//       sort: 'date'
//     }
//   },
//   mutations: {
//     addPage: [
//       {
//         type: 'APPEND', // INCREMENT || DECREMENT || APPEND || PREPEND
//         field: 'pages'
//       },
//       {
//         type: 'INCREMENT',
//         field: 'pagesCount'
//       },
//       {
//         type: 'INCREMENT',
//         field: ['pages', 'pagesCount']
//       }
//     ]
//   }
// })
export default function dataConnect (...args) {
  invariant(args.length, 'Relate: a dataConnect does not have arguments specified');

  const getReduxState = args.length > 1 && args[0];
  const getReduxDispatches = args.length > 2 && args[1];
  const getBundle = args[args.length - 1];

  return function wrapWithDataConnect (WrappedComponent) {
    class ConnectData extends Component {
      static propTypes = {
        relateConnectorData: PropTypes.object
      };

      static contextTypes = {
        fetchData: PropTypes.func.isRequired,
        store: PropTypes.any.isRequired
      };

      static defaultProps = {
        relateConnectorData: {}
      };

      constructor (props, context) {
        super(props, context);

        // Connector id
        this.CONNECTOR_ID = `connector_${ID_COUNTER++}`;

        const initialBundle = getBundle && getBundle(this.props);

        // Relate connector info
        this.variablesTypes = initialBundle && initialBundle.variablesTypes || {};
        this.relate = {
          setVariables: ::this.setVariables,
          refresh: ::this.refresh,
          variables: initialBundle && initialBundle.initialVariables
        };

        // Fetch data
        if (initialBundle) {
          this.fetchData({
            fragments: initialBundle.fragments,
            variables: initialBundle.initialVariables,
            mutations: initialBundle.mutations
          });
        }

        // Set initial state
        this.state = {
          loading: true
        };
      }

      componentWillUnmount () {
        this.context.store.dispatch(removeConnector(this.CONNECTOR_ID));
      }

      getVariables (variables, fragments) {
        const resultVariables = {};
        if (variables) {
          forEach(variables, (vars, queryName) => {
            if (fragments[queryName]) { // if not in fragments, ignore
              resultVariables[queryName] = {};
              const queryVariablesTypes = this.variablesTypes[queryName];

              // No variables types defined for this query
              invariant(
                queryVariablesTypes,
                'Relate: Query to %s doesn\'t have variables types defined in %s!',
                queryName,
                WrappedComponent.displayName || 'a component'
              );

              // Check if every variable has a type
              forEach(vars, (value, variable) => {
                invariant(
                  queryVariablesTypes[variable],
                  'Relate: Query to %s does not have variable "%s" type defined in %s!',
                  queryName,
                  variable,
                  WrappedComponent.displayName || 'a component'
                );

                // add variable prepared for query e.g. {type: 'String', value: 'something'}
                resultVariables[queryName][variable] = {
                  type: queryVariablesTypes[variable],
                  value
                };
              });

              // Check if every required variable type is met
              forEach(queryVariablesTypes, (type, variable) => {
                invariant(
                  type.slice(-1) !== '!' || vars[variable],
                  'Relate: Query to %s requires the variable "%s" in %s!',
                  queryName,
                  variable,
                  WrappedComponent.displayName || 'a component'
                );
              });
            }
          });
        }
        return resultVariables;
      }

      setVariables (variables) {
        const bundle = getBundle && getBundle(this.props);

        // Relate connector info
        this.variablesTypes = bundle && bundle.variablesTypes || {};
        this.relate = {
          setVariables: ::this.setVariables,
          refresh: ::this.refresh,
          variables
        };

        // Fetch data
        if (bundle) {
          this.setState({
            loading: true
          }, () => {
            this.fetchData({
              fragments: bundle.fragments,
              variables,
              mutations: bundle.mutations
            });
          });
        }
      }

      refresh (props = this.props) {
        const bundle = getBundle && getBundle(props);

        // Relate connector info
        this.variablesTypes = bundle && bundle.variablesTypes || {};
        this.relate = {
          setVariables: ::this.setVariables,
          refresh: ::this.refresh,
          variables: this.relate.variables
        };

        // Fetch data
        if (initialBundle) {
          this.fetchData({
            fragments: initialBundle.fragments,
            variables: initialBundle.initialVariables,
            mutations: initialBundle.mutations
          });
        }

        // Fetch data
        if (bundle) {
          this.setState({
            loading: true
          }, () => {
            this.fetchData({
              fragments: bundle.fragments,
              variables: bundle.initialVariables,
              mutations: bundle.mutations
            });
          });
        }
      }

      fetchData ({fragments, variables, mutations}) {
        const {fetchData} = this.context;

        if (fetchData && typeof fragments === 'object' && Object.keys(fragments).length) {
          fetchData({
            fragments,
            variables: this.getVariables(variables, fragments),
            ID: this.CONNECTOR_ID,
            mutations
          })
            .then(() => {
              this.setState({
                loading: false
              });
            });
        }
      }

      render () {
        const {relateConnectorData, ...otherProps} = this.props;
        return (
          <WrappedComponent
            {...otherProps}
            {...relateConnectorData}
            relate={this.relate}
            loading={this.state.loading}
          />
        );
      }
    }

    const Connected = connect(
      () => function map (state, props) {
        const WrappedInstance = this.getWrappedInstance && this.getWrappedInstance();
        return Object.assign(
          getReduxState && getReduxState(state, props) || {},
          {
            relateConnectorData:
              WrappedInstance &&
              state.relateReducer[WrappedInstance.CONNECTOR_ID]
          }
        );
      },
      (dispatch) => Object.assign(
        getReduxDispatches && getReduxDispatches(dispatch) || {},
        {
          removeConnector: dispatch(removeConnector)
        }
      ),
      null,
      {withRef: true}
    )(ConnectData);

    return hoistStatics(Connected, WrappedComponent);
  };
}
