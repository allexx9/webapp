// Copyright 2016-2017 Rigo Investment Sagl.
// By the Power of Grayskull! I Have the Power!

import * as TYPE_ from '../actions/const'
import { Actions } from '../actions'
import BigNumber from 'bignumber.js'
import isFinite from 'lodash/isFinite'
import utils from '../../_utils/utils'

export const poolCalculateValueMiddleWare = store => next => action => {
  if (action.type === TYPE_.TOKENS_TICKERS_UPDATE) {
    const state = store.getState()
    const { assets } = state.transactionsDrago.selectedDrago
    let { current } = state.exchange.prices
    const { details } = state.transactionsDrago.selectedDrago
    current = { ...current, ...action.payload }
    let portfolioValue = utils.calculatePortfolioValue(assets, current)
    let estimatedPrice
    if (new BigNumber(details.totalSupply).eq(0)) {
      estimatedPrice = '0.0000'
    } else {
      estimatedPrice = new BigNumber(portfolioValue)
        .plus(new BigNumber(details.dragoETHBalance))
        .div(new BigNumber(details.totalSupply))
        .toFixed(4)
    }
    portfolioValue = isFinite(Number(portfolioValue)) ? portfolioValue : '-'
    estimatedPrice = isFinite(Number(estimatedPrice)) ? estimatedPrice : '-'
    store.dispatch(
      Actions.drago.updateDragoSelectedDetails({
        values: {
          portfolioValue,
          estimatedPrice
        }
      })
    )
  }
  next(action)
}
