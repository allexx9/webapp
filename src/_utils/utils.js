// import * as abis from '../PoolsApi/src/contracts/abi'
import { APP, DS } from './const'
import { DRG_ISIN } from './const'
import { ERCdEX, Ethfinex } from './const'
import { MOCK_ERC20_TOKENS } from './tokens'
import { dateFromTimeStampHuman } from './misc'
import {
  filterPools,
  getDragoDetails,
  getDragoLiquidityAndTokenBalances,
  getTokenWrapperLockTime,
  getTransactionsDragoOptV2,
  getTransactionsSingleDrago,
  getTransactionsSingleVault,
  getTransactionsVaultOptV2,
  getVaultDetails
} from './pools'
import { getBlockChunks } from './blockChain'
import { toBaseUnitAmount, toUnitAmount } from './format'
import { updateAccounts } from './accounts'
import BigNumber from 'bignumber.js'
import ElementNotification from '../_atomic/molecules/elementNotification'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import PoolApi from '../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Web3 from 'web3'
import Web3Wrapper from './web3Wrapper/src'
import palette from './palete'

class NotificationAlert extends Component {
  static propTypes = {
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string.isRequired,
    eventType: PropTypes.string.isRequired
  }

  render(primaryText, secondaryText, eventType) {
    return (
      <MuiThemeProvider>
        <ElementNotification
          primaryText={primaryText}
          secondaryText={secondaryText}
          eventType={eventType}
          eventStatus="executed"
          txHash=""
        />
      </MuiThemeProvider>
    )
  }
}

class utilities {
  blockChunks = getBlockChunks
  filterPools = filterPools

  sign = (toSign, account) => {
    // metamask will take care of the 3rd parameter, "password"
    if (window.web3.currentProvider.isMetaMask) {
      return window.web3.eth.personal.sign(toSign, account)
    } else {
      return window.web3.eth.sign(toSign, account)
    }
  }
  generateMockAssets = (network = 'mainnet') => {
    let mockAssets = MOCK_ERC20_TOKENS[network]
    delete mockAssets.ETH
    for (let key in mockAssets) {
      let tokenBalance = new BigNumber(Math.floor(Math.random() * 400) + 1)
      let wrapperBalance = new BigNumber(Math.floor(Math.random() * 400) + 1)
      let totalBalance = tokenBalance.plus(wrapperBalance)
      mockAssets[key].balances = {
        token: toBaseUnitAmount(tokenBalance, mockAssets[key].decimals),
        wrappers: {
          Ethfinex: toBaseUnitAmount(wrapperBalance, mockAssets[key].decimals)
        },
        total: toBaseUnitAmount(totalBalance, mockAssets[key].decimals)
      }
    }
    return mockAssets
  }

  updateAccounts = updateAccounts

  // formatFromWei = amount => {
  //   const web3 = new Web3()
  //   try {
  //     return new BigNumber(web3.utils.fromWei(web3.utils.toBN(amount))).toFixed(
  //       3
  //     )
  //   } catch (err) {
  //     return new BigNumber(web3.utils.fromWei(web3.utils.toBN(amount))).toFixed(
  //       3
  //     )
  //   }
  // }

  ethfinexTickersToArray = assets => {
    let assetArray = Array(0)
    for (let token in assets) {
      if (!['ETH', 'WETH', 'USDT', 'ETHW'].includes(assets[token].symbol)) {
        assetArray.push(`${assets[token].symbolTicker.Ethfinex}ETH`)
      }
    }
    assetArray.push(`ETHUSD`)
    return assetArray
  }

  formatToWei = number => {
    const web3 = new Web3()
    try {
      return web3.utils.toWei(number)
    } catch (err) {
      return err
    }
  }

  getTokenSymbolForRelay = (relayName, token) => {
    switch (relayName) {
      case ERCdEX:
        return token.address
      case Ethfinex:
        return token.symbolTicker[Ethfinex]
      default:
        throw new Error('Relay unknown')
    }
  }

  notificationError = (notificationEngine, notification, level = 'error') => {
    try {
      const messageFirstLine =
        typeof notification === 'string'
          ? notification.split(/\r?\n/)
          : notification.message.split(/\r?\n/)
      notificationEngine.addNotification({
        level: level,
        title: level.toUpperCase(),
        message: messageFirstLine[0],
        position: 'br',
        autoDismiss: 10
      })
    } catch (err) {
      console.warn(err)
    }
  }

  notificationAccount = (notificationEngine, message, level = 'info') => {
    try {
      let comp = new NotificationAlert([message])
      notificationEngine.addNotification({
        level: level,
        title: level,
        position: 'br',
        autoDismiss: 10,
        children: comp.render(
          message.primaryText,
          message.secondaryText,
          message.eventType
        )
      })
    } catch (err) {
      console.log(err)
    }
  }

  availableTradeTokensPair = (
    tradeTokensPairs,
    selectedRelayName,
    networkId
  ) => {
    let availableTokens = {}
    for (let baseToken in tradeTokensPairs) {
      Object.keys(tradeTokensPairs[baseToken]).forEach(key => {
        let quoteToken = tradeTokensPairs[baseToken][key]
        if (
          quoteToken.exchanges.includes(selectedRelayName) &&
          quoteToken.networks.includes(networkId)
        ) {
          if (typeof availableTokens[baseToken] === 'undefined') {
            availableTokens[baseToken] = {}
          }
          availableTokens[baseToken][key] = tradeTokensPairs[baseToken][key]
        }
      })
    }
    return availableTokens
  }

  availableRelays = (relays, networkId) => {
    let availableRelays = {}
    Object.keys(relays).forEach(key => {
      if (relays[key].supportedNetworks.includes(networkId.toString())) {
        availableRelays[key] = relays[key]
      }
    })

    return availableRelays
  }

  calculatePortfolioValue = (dragoAssetsList, assetsPrices) => {
    const totalValue = dragoAssetsList.reduce((total, asset) => {
      if (typeof assetsPrices[asset.symbol] !== 'undefined') {
        if (typeof assetsPrices[asset.symbol].priceEth !== 'undefined') {
          if (assetsPrices[asset.symbol].priceEth !== null) {
            const value = new BigNumber(
              assetsPrices[asset.symbol].priceEth
            ).times(
              toUnitAmount(new BigNumber(asset.balances.total), asset.decimals)
            )
            return total.plus(value)
          }
        } else {
          return total.plus(0)
        }
      }
      return total.plus(0)
    }, new BigNumber(0))

    return totalValue.toFixed(5)
  }

  calculatePieChartPortfolioValue = (
    dragoAssetsList,
    assetsPrices,
    dragoETHBalance
  ) => {
    try {
      let labels = Array(0)
      let data = Array(0)
      dragoAssetsList.forEach(asset => {
        if (typeof assetsPrices[asset.symbol] !== 'undefined') {
          if (typeof assetsPrices[asset.symbol].priceEth !== 'undefined') {
            const value = new BigNumber(
              assetsPrices[asset.symbol].priceEth
            ).times(
              toUnitAmount(
                new BigNumber(asset.balances.total),
                asset.decimals
              ).toFixed(5)
            )
            labels.push(asset.symbol)
            data.push(value.toFixed(5))
          }
        }
      })
      data.push(new BigNumber(dragoETHBalance).toFixed(5))
      labels.push('ETH')
      return {
        datasets: [
          {
            data,
            backgroundColor: palette('tol', data.length).map(function(hex) {
              return '#' + hex
            })
          }
        ],
        labels
      }
    } catch (err) {
      console.warn(err)
    }
  }

  dateFromTimeStamp = timestamp => {
    if (typeof timestamp === 'string') {
      timestamp = new Date(timestamp)
    }
    const day = ('0' + timestamp.getDate()).slice(-2)
    const month = ('0' + (timestamp.getMonth() + 1)).slice(-2)
    function addZero(i) {
      return i < 10 ? '0' + i : i
    }
    return (
      timestamp.getFullYear() +
      '-' +
      month +
      '-' +
      day +
      ' ' +
      addZero(timestamp.getHours()) +
      ':' +
      addZero(timestamp.getMinutes()) +
      ':' +
      addZero(timestamp.getSeconds())
    )
  }

  dateFromTimeStampHuman = dateFromTimeStampHuman

  // This funcions needs to be rewritten to work async.
  updateTransactionsQueue = (api, recentTransactions) => {
    let checkTransaction = true
    // let shouldTransactionListUpdate = false
    let newRecentTransactions = new Map(recentTransactions)
    newRecentTransactions.forEach(value => {
      if (value.status === 'executed' || value.status === 'error') {
        return
      }
      // 1.1 Checking if it's a transaction belonging to a Parity account
      if (value.parityId) {
        // 1.2 Checking if the transaction has been accepted (it has got an blockNumber)
        console.log(`Checking if blockhash undefined`)
        if (typeof value.receipt !== 'undefined') {
          console.log(value.receipt.blockNumber)
          // 1.3 Checing if it has blocknumber. It it has it, then no need to proceed further.
          value.receipt.blockNumber.eq(0)
            ? (checkTransaction = true)
            : (checkTransaction = false)
        }
        if (!checkTransaction) {
          return null
        }
        console.log(`Checking request on Parity wallet`)
        api.parity
          .checkRequest(value.parityId, [])
          .then(hash => {
            if (hash) {
              value.hash = hash
              api.eth.getTransactionByHash(hash).then(receipt => {
                value.receipt = receipt
                if (receipt.blockHash) {
                  console.log('executed')
                  value.status = 'executed'
                  value.timestamp = new Date()
                  // shouldTransactionListUpdate = true
                } else {
                  console.log('pending')
                  value.status = 'pending'
                  value.timestamp = new Date()
                  // shouldTransactionListUpdate = true
                }
              })
            }
          })
          .catch(error => {
            // console.log(error)
            value.status = 'error'
            value.error = error
            value.timestamp = new Date()
            // shouldTransactionListUpdate = true
          })
      }
    })
    return newRecentTransactions
  }

  getTransactionsVaultOptV2 = getTransactionsVaultOptV2

  getTransactionsDragoOptV2 = getTransactionsDragoOptV2

  getTransactionsSingleDrago = getTransactionsSingleDrago

  getTransactionsSingleVault = getTransactionsSingleVault

  getPoolDetailsFromId = async (dragoId, networkInfo) => {
    let api = Web3Wrapper.getInstance(networkInfo.id)
    const poolApi = new PoolApi(api)
    await poolApi.contract.dragoregistry.init()
    const dragoDetails = await poolApi.contract.dragoregistry.fromId(dragoId)
    return dragoDetails
  }

  getDragoDetails = getDragoDetails

  getVaultDetails = getVaultDetails

  getTokenWrapperLockTime = getTokenWrapperLockTime

  getDragoLiquidity = async (dragoAddress, api) => {
    const poolApi = new PoolApi(api)
    poolApi.contract.drago.init(dragoAddress)
    const dragoETHBalance = await poolApi.contract.drago.getBalance()
    // const dragoWETHBalance = await poolApi.contract.drago.getBalanceWETH()
    // const dragoZRXBalance = await poolApi.contract.drago.getBalanceZRX()
    // console.log(dragoETHBalance, dragoWETHBalance, dragoZRXBalance)
    // return [dragoETHBalance, dragoWETHBalance, dragoZRXBalance]
    return [dragoETHBalance]
  }

  getDragoLiquidityAndTokenBalances = getDragoLiquidityAndTokenBalances

  shallowEqual(objA, objB, component = '') {
    if (objA === objB) {
      // console.log(`shallowEqual -> objA === objB -> ${component}`)
      return true
    }

    if (
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null
    ) {
      // console.log(`shallowEqual-> objA !== 'object' -> ${component}`)
      return false
    }

    let keysA = Object.keys(objA)
    let keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
      // console.log(`shallowEqual -> keysA.length  -> ${component}`)
      return false
    }

    // Test for A's keys different from B.
    let bHasOwnProperty = hasOwnProperty.bind(objB)
    for (let i = 0; i < keysA.length; i++) {
      if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        // console.log(objA[keysA[i]], objB[keysA[i]])
        // console.log(
        //   `shallowEqual -> Test for A's keys different from B  -> ${component}`
        // )
        return false
      }
    }
    return true
  }

  pathExplode(path) {
    let explodedPath = path.pathname.split('/')
    return explodedPath
  }

  rootPath(location) {
    let path = location.split('/')
    // path.splice(-1,1);
    // var url = path.join('/');
    return DS + APP + DS + path[2]
  }

  pathLast(path) {
    return path.pathname.split('/').pop()
  }

  customRelayAction = action => {
    // console.log(`${Ethfinex.toUpperCase()}_${action}`)
    return `${Ethfinex.toUpperCase()}_${action}`
  }

  dragoISIN(symbol, dragoId) {
    return DRG_ISIN + dragoId.toString().padStart(7, '0') + symbol.toUpperCase()
  }

  logger = (function() {
    let pub = {}

    pub.enable = function enableLogger() {
      if (this.oldConsoleLog == null) return

      window['console']['log'] = this.oldConsoleLog
    }

    pub.disable = function disableLogger() {
      this.oldConsoleLog = console.log
      window['console']['log'] = function() {}
    }

    return pub
  })()
}

const utils = new utilities()

export default utils
