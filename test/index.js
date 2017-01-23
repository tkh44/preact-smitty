/* eslint-env mocha */
import expect from 'expect'
import { Provider, connect } from '../src/index'

describe('smitty', () => {
  it('store is created', () => {
    expect(Provider).toExist()
  })

  it('store has a state', () => {
    expect(connect).toExist()
  })
})
