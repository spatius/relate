import forEach from 'lodash.foreach';
import hoistStatics from 'hoist-non-react-statics';
import invariant from 'invariant';
import warning from 'warning';
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import removeConnector from '../actions/remove-connector';

var ID_COUNTER = 0;

export default function dataConnect (getReduxState, getReduxDispatches, _getBundle) {
  // let not defining redux functions
  let getBundle = _getBundle;
  if (arguments.length === 1) {
    getBundle = getReduxState;
  }

  // Connector id
  const CONNECTOR_ID = 'connector_' + ID_COUNTER++;

  return function wrapWithDataConnect (WrappedComponent) {
    @connect(
      (state, props) => {
        return Object.assign(getReduxState && getReduxState(state, props) || {}, {
          relateConnectorData: state.graphql[CONNECTOR_ID]
        });
      },
      (dispatch) => {
        return Object.assign(getReduxDispatches && getReduxDispatches(dispatch) || {}, {
          removeConnector: dispatch(removeConnector)
        });
      }
    )
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

        warning(getBundle, `Relate: Data connector data info not configured in ${WrappedComponent.displayName || 'a component'}, use Redux connect instead!`);

        const initialBundle = getBundle && getBundle(this.props);

        // Relate connector info
        this.variablesTypes = initialBundle && initialBundle.variablesTypes || {};
        this.relate = {
          setVariables: ::this.setVariables,
          variables: initialBundle && initialBundle.initialVariables
        };

        // Fetch data
        initialBundle && this.fetchData({
          fragments: initialBundle.fragments,
          variables: initialBundle.initialVariables,
          mutations: initialBundle.mutations
        });

        // Set initial state
        this.state = {
          loading: true
        };
      }

      componentWillUnmount () {
        this.context.store.dispatch(removeConnector(CONNECTOR_ID));
      }

      setVariables (variables) {
        const bundle = getBundle && getBundle(this.props);
        this.relate.variables = variables;

        // Fetch data
        bundle && this.fetchData({
          fragments: bundle.fragments,
          variables: variables,
          mutations: bundle.mutations
        });
      }

      getVariables (variables) {
        const resultVariables = {};
        if (variables) {
          forEach(variables, (vars, queryName) => {
            resultVariables[queryName] = {};
            const queryVariablesTypes = this.variablesTypes[queryName];

            // No variables types defined for this query
            invariant(queryVariablesTypes, `Relate Error: Query to ${queryName} doesn't have variables types defined in ${WrappedComponent.displayName || 'a component'}!`);

            // Check if every variable has a type
            forEach(vars, (value, variable) => {
              invariant(queryVariablesTypes[variable], `Relate Error: Query to ${queryName} doesn't have variable '${variable}' type defined in ${WrappedComponent.displayName || 'a component'}!`);

              // add variable prepared for query e.g. {type: 'String', value: 'something'}
              resultVariables[queryName][variable] = {
                type: queryVariablesTypes[variable],
                value
              };
            });

            // Check if every required variable type is met
            forEach(queryVariablesTypes, (type, variable) => {
              invariant(type.slice(-1) !== '!' || vars[variable], `Relate Error: Query to ${queryName} requires the variable '${variable}' in ${WrappedComponent.displayName || 'a component'}!`);
            });
          });
        }
        return resultVariables;
      }

      fetchData ({fragments, variables, mutations}) {
        const {fetchData} = this.context;

        if (fetchData) {
          fetchData({
            fragments,
            variables: this.getVariables(variables),
            ID: CONNECTOR_ID,
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
        return <WrappedComponent {...otherProps} {...relateConnectorData} relate={this.relate} loading={this.state.loading} />;
      }
    }

    return hoistStatics(ConnectData, WrappedComponent);
  };
}
