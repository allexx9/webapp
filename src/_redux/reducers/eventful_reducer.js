// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../actions/const'
import initialState from './initialState'

export function eventfulDragoReducer(
  state = initialState.transactionsDrago,
  action
) {
  switch (action.type) {
    case TYPE_.UPDATE_DRAGOS_LIST: {
      let newList = [].concat(state.dragosList.list.concat(action.payload.list))
      newList.sort(function(a, b) {
        if (a.symbol < b.symbol) return -1
        if (a.symbol > b.symbol) return 1
        return 0
      })
      return {
        ...state,
        dragosList: {
          list: newList,
          lastFetchRange: action.payload.lastFetchRange
        }
      }
    }
    case TYPE_.UPDATE_TRANSACTIONS_DRAGO_HOLDER:
      return {
        ...state,
        holder: {
          balances: action.payload[0],
          logs: action.payload[1]
        }
      }

    case TYPE_.UPDATE_TRANSACTIONS_DRAGO_MANAGER:
      return {
        ...state,
        manager: {
          list: action.payload[2],
          logs: action.payload[1],
          portfolio: { ...state.manager.logs }
        }
      }

    case TYPE_.UPDATE_SELECTED_DRAGO_DETAILS: {
      return {
        ...state,
        selectedDrago: {
          ...state.selectedDrago,
          values: {
            ...state.selectedDrago.values,
            ...(action.payload.values || {})
          },
          details: {
            ...state.selectedDrago.details,
            ...(action.payload.details || {})
          },
          transactions: [
            ...(action.payload.transactions ||
              [].concat(state.selectedDrago.transactions))
          ],
          assets: [
            ...(action.payload.assets || [].concat(state.selectedDrago.assets))
          ],
          assetsCharts: {
            ...state.selectedDrago.assetsCharts,
            ...(action.payload.assetsCharts || {})
          }
        }
      }
    }

    case TYPE_.UPDATE_SELECTED_DRAGO_DETAILS_RESET:
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

    case TYPE_.UPDATE_SELECTED_DRAGO_DETAILS_CHART_ASSETS_MARKET_DATA_INIT: {
      // console.log(action)
      let selectedDrago = { ...state.selectedDrago }
      // console.log(selectedDrago)
      selectedDrago.assetsCharts = {
        ...selectedDrago.assetsCharts,
        ...action.payload
      }
      return {
        ...state,
        selectedDrago: { ...state.selectedDrago, ...selectedDrago }
      }
    }

    case TYPE_.UPDATE_SELECTED_DRAGO_DETAILS_CHART_ASSETS_MARKET_ADD_DATAPOINT: {
      let selectedDrago = { ...state.selectedDrago }
      // console.log(action)
      // console.log(Object.keys(action.payload)[0])
      // console.log(action.payload[Object.keys(action.payload)[0]])
      let symbol = Object.keys(action.payload)[0]
      let newTicker = action.payload[symbol].data
      let oldData = selectedDrago.assetsCharts[symbol].data
      // let newChartData = [...state.chartData]
      // console.log(newTicker.epoch, oldData[oldData.length - 1].epoch)
      if (newTicker.epoch === oldData[oldData.length - 1].epoch) {
        oldData[oldData.length - 1] = newTicker
        // console.log('first')
        return {
          ...state,
          selectedDrago: { ...state.selectedDrago, ...selectedDrago }
        }
      }
      if (newTicker.epoch === oldData[oldData.length - 2].epoch) {
        oldData[oldData.length - 2] = newTicker
        // console.log('second')
        return {
          ...state,
          selectedDrago: { ...state.selectedDrago, ...selectedDrago }
        }
      }

      // oldData.pop()
      // console.log('***** NEW *****')
      // console.log(action.payload)
      oldData.push(newTicker)
      selectedDrago.assetsCharts[symbol].data = oldData
      return {
        ...state,
        selectedDrago: { ...state.selectedDrago, ...selectedDrago }
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
    case TYPE_.UPDATE_VAULTS_LIST: {
      let newList = [].concat(state.vaultsList.list.concat(action.payload.list))
      newList.sort(function(a, b) {
        if (a.symbol < b.symbol) return -1
        if (a.symbol > b.symbol) return 1
        return 0
      })
      return {
        ...state,
        vaultsList: {
          list: newList,
          lastFetchRange: action.payload.lastFetchRange
        }
      }
    }
    case TYPE_.UPDATE_TRANSACTIONS_VAULT_HOLDER:
      return {
        ...state,
        holder: {
          balances: action.payload[0],
          logs: action.payload[1]
        }
      }
    case TYPE_.UPDATE_TRANSACTIONS_VAULT_MANAGER:
      return {
        ...state,
        manager: {
          list: action.payload[2],
          logs: action.payload[1]
        }
      }
    case TYPE_.UPDATE_SELECTED_VAULT_DETAILS:
      return {
        ...state,
        selectedVault: {
          details: {
            ...state.selectedVault.details,
            ...(action.payload.details || {})
          },
          transactions: [
            ...(action.payload.transactions ||
              [].concat(state.selectedVault.transactions))
          ]
        }
      }
    case TYPE_.UPDATE_SELECTED_VAULT_DETAILS_RESET:
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
