import expect from 'expect';
import { createStore } from 'redux'

import { relateReducer, setHeader, removeHeader, setEndpoint } from '../../lib'

describe('Settings', () => {
  
  it('Default headers and endpoint are correctly set', () => {
    
    let expectedState = {
      settings: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        endpoint: '/graphql'
      }
    }
    
    expect(relateReducer(undefined)).toEqual(expectedState)
      
  })

  it('Redux store initialState is merged with defaults', () => {
    
    let initialState = {
      settings: {
        endpoint: '/test'
      }
    }
    
    let store = createStore(relateReducer, initialState)
        
    expect(store.getState().settings.endpoint).toEqual('/test')
    expect(store.getState().settings.headers).toExist()
    
  })

  it('setHeader action correctly adds header', () => {
    
    let state = relateReducer(undefined, setHeader('foo', 'bar'))

    expect(state.settings.headers.foo).toEqual('bar')
    
  })

  it('Duplicate setHeader overwrites the previous header', () => {
    
    let state1 = relateReducer(undefined, setHeader('foo', 'bar'))
    let state2 = relateReducer(state1, setHeader('foo', 'bar2'))

    expect(state2.settings.headers.foo).toEqual('bar2')
    
  })

  it('removeHeader correctly removes header', () => {
    
    let state1 = relateReducer(undefined, setHeader('foo', 'bar'))
    let state2 = relateReducer(state1, removeHeader('foo'))
    expect(state2.settings.headers.foo).toNotExist()
    
  })

  it('setEndpoint correctly sets endpoint', () => {
    
    let state = relateReducer(undefined, setEndpoint('/test'))
    
    expect(state.settings.endpoint).toEqual('/test')
    
  })
  
})
