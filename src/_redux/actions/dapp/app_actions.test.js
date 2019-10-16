import * as TYPE_ from '../const'
import { Actions } from '../index'

describe('app actions creator', () => {
  it(`${TYPE_.APP_STATUS_UPDATE} success`, () => {
    let input = {
      test: 'test'
    }
    const results = Actions.app.updateAppStatus(input)
    expect(results).toEqual({
      type: TYPE_.APP_STATUS_UPDATE,
      payload: { test: 'test' }
    })
  })
  it(`${TYPE_.APP_CONFIG_UPDATE} success`, () => {
    let input = {
      test: 'test'
    }
    const results = Actions.app.updateAppConfig(input)
    expect(results).toEqual({
      type: TYPE_.APP_CONFIG_UPDATE,
      payload: { test: 'test' }
    })
  })
})
