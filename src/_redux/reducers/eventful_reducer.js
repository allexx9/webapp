// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../actions/const'
import initialState from './initialState'
import u from 'updeep'

export function eventfulDragoReducer(
  state = initialState.transactionsDrago,
  action
) {
  switch (action.type) {
    case TYPE_.DRAGO_HOLDER_TRANSACTIONS_UPDATE:
      return {
        ...state,
        holder: {
          balances: action.payload[0],
          logs: action.payload[1]
        }
      }
    case TYPE_.DRAGO_MANAGER_TRANSACTIONS_UPDATE:
      return {
        ...state,
        manager: {
          list: action.payload[2],
          logs: action.payload[1],
          portfolio: { ...state.manager.logs }
        }
      }

    case TYPE_.DRAGO_SELECTED_DETAILS_UPDATE: {
      const newDetails = u(action.payload, state.selectedDrago)
      return { ...state, selectedDrago: { ...newDetails } }
    }

    case TYPE_.DRAGO_SELECTED_DETAILS_RESET:
      return {
        ...state,
        selectedDrago: {
          values: {
            portfolioValue: -1,
            totalAssetsValue: -1,
            estimatedPrice: -1
          },
          details: {},
          transactions: [],
          assets: [],
          assetsCharts: {}
        }
      }

    case TYPE_.SELECTED_DRAGO_DETAILS_UPDATE_CHART_ASSETS_MARKET_DATA_INIT: {
      let selectedDrago = { ...state.selectedDrago }
      selectedDrago.assetsCharts = {
        ...selectedDrago.assetsCharts,
        ...action.payload
      }
      return {
        ...state,
        selectedDrago: { ...state.selectedDrago, ...selectedDrago }
      }
    }

    case TYPE_.SELECTED_DRAGO_DETAILS_UPDATE_CHART_ASSETS_MARKET_ADD_DATAPOINT: {
      let selectedDrago = { ...state.selectedDrago }
      let symbol = Object.keys(action.payload)[0]
      let newTicker = action.payload[symbol].data
      let oldData = [].concat(selectedDrago.assetsCharts[symbol].data)
      if (newTicker.epoch === oldData[oldData.length - 1].epoch) {
        oldData[oldData.length - 1] = newTicker
        // console.log('first')
        return {
          ...state
        }
      }
      if (newTicker.epoch === oldData[oldData.length - 2].epoch) {
        oldData[oldData.length - 2] = newTicker
        // console.log('second')
        return {
          ...state
        }
      }

      // console.log('***** NEW *****')
      oldData.push(newTicker)
      return {
        ...state,
        selectedDrago: {
          ...state.selectedDrago,
          assetsCharts: {
            ...state.selectedDrago.assetsCharts,
            [symbol]: {
              ...state.selectedDrago.assetsCharts[symbol],
              data: [].concat(oldData)
            }
          }
        }
      }
    }

    default:
      return state
  }
}

export function eventfulVaultReducer(
  state = initialState.transactionsVault,
  action
) {
  switch (action.type) {
    case TYPE_.VAULT_HOLDER_TRANSACTIONS_UPDATE:
      return {
        ...state,
        holder: {
          balances: action.payload[0],
          logs: action.payload[1]
        }
      }
    case TYPE_.VAULT_MANAGER_TRANSACTIONS_UPDATE:
      return {
        ...state,
        manager: {
          list: action.payload[2],
          logs: action.payload[1]
        }
      }

    case TYPE_.VAULT_SELECTED_DETAILS_UPDATE: {
      const newDetails = u(action.payload, state.selectedVault)
      console.log(newDetails)
      return { ...state, selectedVault: { ...newDetails } }
    }

    case TYPE_.VAULT_SELECTED_DETAILS_RESET:
      return {
        ...state,
        selectedVault: {
          details: {},
          transactions: []
        }
      }
    default:
      return state
  }
}
