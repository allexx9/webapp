// import * as abis from '../PoolsApi/src/contracts/abi'
import { APP, DS } from './const'
import { DRG_ISIN } from './const'
import { ERCdEX, Ethfinex } from './const'
import {
  formatCoins,
  formatEth,
  toBaseUnitAmount,
  toUnitAmount
} from './format'
import BigNumber from 'bignumber.js'
import ElementNotification from '../Elements/elementNotification'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import PoolApi from '../PoolsApi/src'
import Web3 from 'web3'
import palette from './palete'

import { Actions } from '../_redux/actions'
import { MOCK_ERC20_TOKENS } from './tokens'

import {
  MSG_NETWORK_STATUS_ERROR,
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
  NETWORK_WARNING
} from './const'
import PoolsApi from '../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'

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

  updateAccounts = async (api, blockNumber, state$) => {
    const currentState = state$.value
    const { endpoint } = currentState
    let newEndpoint = {}
    const prevBlockNumber = endpoint.prevBlockNumber
    const prevNonce = endpoint.prevNonce
    let newBlockNumber = new BigNumber(0)
    let notifications = Array(0)
    let fetchTransactions = false
    console.log(currentState)
    // Checking if blockNumber is passed by Parity Api or Web3
    if (typeof blockNumber.number !== 'undefined') {
      newBlockNumber = new BigNumber(blockNumber.number)
    } else {
      newBlockNumber = blockNumber
    }
    console.log(`endpoint_epic -> Last block: ` + prevBlockNumber)
    console.log(`endpoint_epic -> New block: ` + newBlockNumber.toFixed())
    console.log(`endpoint_epic -> Last nonce: ` + prevNonce)

    if (new BigNumber(prevBlockNumber).gte(new BigNumber(newBlockNumber))) {
      console.log(
        `endpoint_epic -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`
      )
      newEndpoint = {
        prevBlockNumber: prevBlockNumber
      }
      return [newEndpoint, notifications, fetchTransactions]
    }

    const accounts = [].concat(endpoint.accounts)
    if (accounts.length !== 0) {
      let newNonce = await api.eth.getTransactionCount(
        endpoint.accounts[0].address
      )
      newNonce = new BigNumber(newNonce).toFixed()
      console.log(`endpoint_epic -> New nonce: ` + newNonce)
      try {
        const poolsApi = new PoolsApi(api)
        poolsApi.contract.rigotoken.init()
        // Checking GRG balance
        const grgQueries = accounts.map(account => {
          // console.log(
          //   `endpoint_epic -> API call getBalance RigoToken-> applicationDragoHome: Getting balance of account ${
          //     account.address
          //   }`
          // )
          return poolsApi.contract.rigotoken.balanceOf(account.address)
        })

        // Checking ETH balance
        const ethQueries = accounts.map(account => {
          // console.log(
          //   `endpoint_epic -> API call getBalance -> applicationDragoHome: Getting balance of account ${
          //     account.address
          //   }`
          // )
          return api.eth.getBalance(account.address, 'latest')
        })
        const ethBalances = await Promise.all(ethQueries)
        const grgBalances = await Promise.all(grgQueries)
        const prevAccounts = [].concat(endpoint.accounts)
        prevAccounts.forEach(function(account, index) {
          // Checking ETH balance
          const newEthBalance = new BigNumber(ethBalances[index])
          const prevEthBalance = new BigNumber(account.ethBalanceWei)
          // console.log(
          //   `Old balance at block ${prevBlockNumber} -> ${prevEthBalance.toFixed()}`
          // )
          // console.log(
          //   `New balance at block ${newBlockNumber} -> ${newEthBalance.toFixed()}`
          // )
          if (
            !new BigNumber(newEthBalance).eq(prevEthBalance) &&
            // prevBlockNumber !== 0 &&
            prevNonce !== 0
          ) {
            console.log(`ETH ${account.name} balance changed.`)
            fetchTransactions = true
            let secondaryText = []
            let balDifference = prevEthBalance.minus(newEthBalance)
            // console.log(prevEthBalance.toFixed(), newEthBalance.toFixed())
            // console.log(balDifference.toFixed())
            if (balDifference.gt(new BigNumber(0))) {
              console.log(
                `endpoint_epic -> You transferred ${utils.formatFromWei(
                  balDifference
                )} ETH!`
              )
              secondaryText[0] = `You transferred ${utils.formatFromWei(
                balDifference
              )} ETH!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            } else {
              console.log(
                `endpoint_epic -> You received ${Math.abs(
                  utils.formatFromWei(balDifference)
                )} ETH!`
              )
              secondaryText[0] = `You received ${Math.abs(
                utils.formatFromWei(balDifference)
              )} ETH!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            }
            if (endpoint.accountsBalanceError === false) {
              notifications.push({
                primaryText: account.name,
                secondaryText: secondaryText,
                eventType: 'transfer'
              })
            }
          }

          // Checking GRG balance
          const newgrgBalance = new BigNumber(grgBalances[index])
          const prevGrgBalance = new BigNumber(account.grgBalanceWei)
          // console.log(newgrgBalance, prevGrgBalance)
          if (
            !new BigNumber(newgrgBalance).eq(prevGrgBalance) &&
            // prevBlockNumber !== 0 &&
            prevNonce !== 0
          ) {
            console.log(`GRG ${account.name} balance changed.`)
            fetchTransactions = true
            let secondaryText = []
            let balDifference = prevGrgBalance.minus(newgrgBalance)
            if (balDifference.gt(new BigNumber(0))) {
              console.log(
                `endpoint_epic -> You transferred ${utils.formatFromWei(
                  balDifference
                )} GRG!`
              )
              secondaryText[0] = `You transferred ${utils.formatFromWei(
                balDifference
              )} GRG!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            } else {
              console.log(
                `endpoint_epic -> You received ${Math.abs(
                  utils.formatFromWei(balDifference)
                )} GRG!`
              )
              secondaryText[0] = `You received ${Math.abs(
                utils.formatFromWei(balDifference)
              )} GRG!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            }
            if (endpoint.accountsBalanceError === false) {
              notifications.push({
                primaryText: account.name,
                secondaryText: secondaryText,
                eventType: 'transfer'
              })
            }
          }
        })
        newEndpoint = {
          prevBlockNumber: newBlockNumber.toFixed(),
          prevNonce: newNonce,
          loading: false,
          networkError: NETWORK_OK,
          networkStatus: MSG_NETWORK_STATUS_OK,
          accountsBalanceError: false,
          grgBalance: grgBalances.reduce(
            (total, balance) => total.plus(balance),
            new BigNumber(0)
          ),
          ethBalance: ethBalances.reduce(
            (total, balance) => total.plus(balance),
            new BigNumber(0)
          ),
          accounts: [].concat(
            accounts.map((account, index) => {
              const ethBalance = ethBalances[index]
              account.ethBalance = utils.formatFromWei(ethBalance)
              account.ethBalanceWei = new BigNumber(ethBalance)
              const grgBalance = grgBalances[index]
              account.grgBalance = utils.formatFromWei(grgBalance)
              account.grgBalanceWei = new BigNumber(grgBalance)
              return account
            })
          )
        }
        return [newEndpoint, notifications, fetchTransactions]
      } catch (error) {
        console.log(`endpoint_epic -> ${error}`)
        // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
        newEndpoint = {
          prevBlockNumber: newBlockNumber.toFixed(),
          loading: false,
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
          accountsBalanceError: true
        }
        return [newEndpoint, notifications, fetchTransactions]
      }
    } else {
      const newEndpoint = { ...endpoint }
      newEndpoint.loading = false
      newEndpoint.prevBlockNumber = newBlockNumber.toFixed()
      return [newEndpoint, notifications, fetchTransactions]
    }
  }

  formatFromWei = number => {
    const web3 = new Web3()
    try {
      return new BigNumber(web3.utils.fromWei(number.toFixed())).toFixed(3)
    } catch (err) {
      return new BigNumber(web3.utils.fromWei(number)).toFixed(3)
    }
  }

  ethfinexTickersToArray = assets => {
    let assetArray = Array(0)
    for (let token in assets) {
      if (!['ETH', 'WETH', 'USDT', 'ETHW'].includes(assets[token].symbol)) {
        assetArray.push(`t${assets[token].symbolTicker.Ethfinex}ETH`)
      }
    }
    assetArray.push(`tETHUSD`)
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

  getTockenSymbolForRelay = (relayName, token) => {
    switch (relayName) {
      case ERCdEX:
        return token.address
      case Ethfinex:
        return token.symbolTicker[Ethfinex]
      default:
        throw new Error('Relay unknown')
    }
  }

  notificationError = (notificationEngine, message, level = 'error') => {
    const messageFirstLine = message.split(/\r?\n/)
    notificationEngine.addNotification({
      level: level,
      title: level.toUpperCase(),
      message: messageFirstLine[0],
      position: 'br',
      autoDismiss: 10
    })
  }

  notificationAccount = (notificationEngine, message, level = 'info') => {
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
    let labels = Array(0)
    let data = Array(0)
    dragoAssetsList.map(asset => {
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
  }

  dateFromTimeStamp = timestamp => {
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

  dateFromTimeStampHuman = timestamp => {
    const day = ('0' + timestamp.getDate()).slice(-2)
    const locale = 'en-us'
    const year = timestamp.getFullYear()
    const month = timestamp.toLocaleString(locale, { month: 'long' })
    return day + ' ' + month + ' ' + year
  }

  // This funcions needs to be rewritten to work async.
  updateTransactionsQueue = (api, recentTransactions) => {
    let checkTransaction = true
    let shouldTransactionListUpdate = false
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
                  shouldTransactionListUpdate = true
                } else {
                  console.log('pending')
                  value.status = 'pending'
                  value.timestamp = new Date()
                  shouldTransactionListUpdate = true
                }
              })
            }
          })
          .catch(error => {
            // console.log(error)
            value.status = 'error'
            value.error = error
            value.timestamp = new Date()
            shouldTransactionListUpdate = true
          })
      }
    })
    return newRecentTransactions
  }

  blockChunks = (start, end, chunk) => {
    let rangesArray = []
    let i = 0
    let fromBlock = end - chunk
    let toBlock = end

    if (end - chunk < start) {
      rangesArray.push({
        fromBlock: start,
        toBlock: 'latest'
      })
      // console.log(
      //   `***** Chunk ${i} -> fromBlock ${start} -> toBlock ${end} ('latest')`
      // )
      return rangesArray
    }
    while (toBlock > start) {
      if (i === 0) {
        rangesArray.push({
          fromBlock: fromBlock + 1,
          toBlock: 'latest'
        })
      } else {
        rangesArray.push({
          fromBlock: fromBlock + 1,
          toBlock: toBlock
        })
      }
      // console.log(
      //   `***** Chunk ${i} -> fromBlock ${fromBlock + 1} -> toBlock ${toBlock}`
      // )
      i++
      // fromBlock = fromBlock - chunk
      // toBlock = toBlock - chunk
      if (i > 100) break
      if (fromBlock - chunk < start) {
        rangesArray.push({
          fromBlock: Number(start),
          toBlock: fromBlock
        })
        // console.log(
        //   `***** Chunk ${i} -> fromBlock ${Number(
        //     start
        //   )} -> toBlock ${fromBlock}`
        // )
        break
      }
      fromBlock = fromBlock - chunk
      toBlock = toBlock - chunk
    }
    // logger.info(`${JSON.stringify(rangesArray)}`)
    rangesArray.map((chunk, key) => {
      // console.log(
      //   `***** Chunk ${key} -> fromBlock ${chunk.fromBlock} -> toBlock ${
      //     chunk.toBlock
      //   }`
      // )
    })
    return rangesArray
  }

  logToEvent = (log, dragoSymbolRegistry, api) => {
    const key = api.util.sha3(JSON.stringify(log))

    const {
      address,
      blockNumber,
      event,
      logIndex,
      returnValues,
      transactionHash,
      transactionIndex
    } = log

    const hexToString = hex => {
      let string = ''
      for (let i = 0; i < hex.length; i += 2) {
        string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
      }
      return string
    }

    // Getting the transaction amounts if it's a buy or sell event
    let ethvalue,
      drgvalue = 0

    if (
      typeof returnValues.amount !== 'undefined' &&
      typeof returnValues.revenue !== 'undefined'
    ) {
      ethvalue =
        event === 'BuyDrago' || event === 'BuyVault'
          ? formatEth(returnValues.amount, null, api)
          : formatEth(returnValues.revenue, null, api)
      drgvalue =
        event === 'SellDrago' || event === 'SellVault'
          ? formatCoins(returnValues.amount, null, api)
          : formatCoins(returnValues.revenue, null, api)
    }
    // Creating a map with list of dragos
    if (
      event === 'BuyDrago' ||
      event === 'DragoCreated' ||
      event === 'BuyVault' ||
      event === 'VaultCreated'
    ) {
      let poolAddress = returnValues.drago || returnValues.vault
      let data
      if (returnValues.drago) {
        data = {
          symbol: returnValues.symbol,
          vaultId: null,
          name: null,
          address: poolAddress
        }
      }
      if (returnValues.vault) {
        data = {
          symbol: returnValues.symbol,
          vaultId: null,
          name: null,
          address: poolAddress
        }
      }

      !dragoSymbolRegistry.has(poolAddress)
        ? dragoSymbolRegistry.set(poolAddress, data)
        : null
    }
    let symbol
    if (typeof returnValues.symbol === 'string') {
      '0x' === returnValues.symbol.substring(0, 2)
        ? (symbol = hexToString(returnValues.symbol.substring(2)))
        : (symbol = returnValues.symbol)
    } else {
      for (let i = 0; i < returnValues.symbol.length; ++i) {
        symbol += String.fromCharCode(returnValues.symbol[i])
      }
    }
    return {
      address,
      type: event,
      blockNumber: new BigNumber(blockNumber),
      logIndex,
      transactionHash,
      transactionIndex,
      params: returnValues,
      key,
      ethvalue,
      drgvalue,
      symbol: symbol
    }
  }

  getTransactionsVaultOptV2 = async (
    api,
    poolAddress,
    accounts = [],
    options = {
      balance: true,
      supply: false,
      limit: 20,
      trader: true,
      drago: false
    }
  ) => {
    if (poolAddress)
      return this.getTransactionsSingleVault(
        poolAddress,
        api,
        accounts,
        options
      )
    let startTime = new Date()
    if (accounts.length === 0) {
      return Array(0), Array(0), Array(0)
    }
    const poolApi = new PoolApi(api)
    let dragoSymbolRegistry = new Map()
    let fromBlock
    switch (api._rb.network.id) {
      case 1:
        fromBlock = '6000000'
        break
      case 42:
        fromBlock = '7000000'
        break
      case 3:
        fromBlock = '3000000'
        break
      default:
        '3000000'
    }

    console.log(
      `***** ${moment().format()} Utils: ${
        options.drago ? 'DRAGO' : 'VAULT'
      } events fetching started *****`
    )


    const logToEvent = log => {
      return this.logToEvent(log, dragoSymbolRegistry, api)
    }

    // Getting all buyDrago and selDrago events since block 0.
    // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
    // to be passed to getAllLogs. Events are indexed and filtered by topics
    // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

    // The second param of the topics array is the drago address
    // The third param of the topics array is the from address
    // The third param of the topics array is the to address
    //
    //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

    let hexAccounts = null
    let hexPoolAddress = null
    if (poolAddress)
      hexPoolAddress = ['0x' + poolAddress.substr(2).padStart(64, '0')]
    // Formatting accounts address
    if (accounts !== null) {
      hexAccounts = accounts.map(account => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
        return hexAccount
      })
    }

    const getPoolsFromOwner = async () => {
      let arrayPromises = accounts.map(async account => {
        await poolApi.contract.vaultfactory.init()
        const poolsList = await poolApi.contract.vaultfactory
          .getVaultsByAddress(account.address)
          .then(results => {
            return results
          })
          .catch(error => {
            console.warn(error)
            throw error
          })
        poolsList.forEach(v => {
          const dragoData = {
            symbol: null,
            vaultId: null,
            name: null,
            address: v.value
          }
          !dragoSymbolRegistry.has(v.value)
            ? dragoSymbolRegistry.set(v.value, dragoData)
            : null
        })
        return poolsList
      })
      return Promise.all(arrayPromises)
    }

    if (options.trader) {
    } else {
      await getPoolsFromOwner()
    }

    // Initializing the eventful contract
    return poolApi.contract.dragoregistry.init().then(() => {
      return poolApi.contract.vaulteventful.init().then(() => {
        const getChunkedEvents = topics => {
          let arrayPromises = []
          return api.eth.blockNumber().then(lastBlock => {
            let chunck = 100000
            const chunks = this.blockChunks(fromBlock, lastBlock, chunck)
            arrayPromises = chunks.map(async chunk => {
              // Pushing chunk logs into array
              let options = {
                topics: topics,
                fromBlock: chunk.fromBlock,
                toBlock: chunk.toBlock
              }
              return await poolApi.contract.vaulteventful.getAllLogs(options)
            })

            return Promise.all(arrayPromises).then(results => {
              if (options.trader) {
              } else {
              }
              let dragoTransactionsLog = Array(0).concat(...results)
              const logs = dragoTransactionsLog.map(logToEvent)
              return logs
            })
          })
        }

        let eventSig
        eventSig = options.drago
          ? [
              poolApi.contract.vaulteventful.hexSignature.BuyDrago,
              poolApi.contract.vaulteventful.hexSignature.SellDrago
            ]
          : [
              poolApi.contract.vaulteventful.hexSignature.BuyVault,
              poolApi.contract.vaulteventful.hexSignature.SellVault
            ]

        let topicsBuySell = [eventSig, hexPoolAddress, hexAccounts, null]

        eventSig = options.drago
          ? [poolApi.contract.vaulteventful.hexSignature.DragoCreated]
          : [poolApi.contract.vaulteventful.hexSignature.VaultCreated]

        let topicsCreate = [eventSig, hexPoolAddress, null, hexAccounts]

        let promisesEvents = null

        if (options.trader) {
          promisesEvents = [getChunkedEvents(topicsBuySell)]
        } else {
          promisesEvents = [getChunkedEvents(topicsCreate)]
        }
        return Promise.all(promisesEvents)
          .then(results => {
            let allLogs = [...results[0]]
            // Creating an array of promises that will be executed to add timestamp and symbol to each entry
            // Doing so because for each entry we need to make an async call to the client
            // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
            // console.log(results)

            function compare(a, b) {
              // Use toUpperCase() to ignore character casing
              const bloclNumberA = a.blockNumber
              const bloclNumberB = b.blockNumber

              let comparison = 0
              if (bloclNumberA.gt(bloclNumberB)) {
                comparison = 1
              } else if (bloclNumberA.lt(bloclNumberB)) {
                comparison = -1
              }
              return comparison
            }
            let supply = []
            let balances = []
            let balancesList = []
            allLogs.sort(compare)
            let dragoTransactionsLogs = allLogs.slice(
              allLogs.length - 20,
              allLogs.length
            )

            // This is an inefficient way to get the symbol for each transactions.
            // In the future the symbol will have to be saved in the eventful logs.
            const getDragoDetails = () => {
              let arrayPromises = []
              dragoSymbolRegistry.forEach((v, k) => {
                arrayPromises.push(
                  poolApi.contract.dragoregistry
                    .fromAddress(k)
                    .then(dragoDetails => {
                      const dragoData = {
                        symbol: dragoDetails[2].trim(),
                        vaultId: dragoDetails[3].toFixed(),
                        name: dragoDetails[1].trim(),
                        address: k.trim()
                      }
                      dragoSymbolRegistry.set(k, dragoData)
                      return dragoDetails
                    })
                    .catch(error => {
                      console.warn(error)
                      throw error
                    })
                )
              })
              return arrayPromises
            }

            // Getting dragos supply
            const getDragoSupply = () => {
              let arrayPromises = []
              if (options.supply === false) {
                supply = []
                return arrayPromises
              }
              dragoSymbolRegistry.forEach((v, k) => {
                poolApi.contract.vault.init(k)
                arrayPromises.push(
                  poolApi.contract.vault
                    .totalSupply()
                    .then(dragoSupply => {
                      const {
                        symbol,
                        name,
                        vaultId,
                        address
                      } = dragoSymbolRegistry.get(k)
                      supply.push({
                        supply: formatCoins(new BigNumber(dragoSupply), 4, api),
                        name: name.trim(),
                        symbol: symbol,
                        vaultId: vaultId,
                        address: address
                      })
                    })
                    .catch(error => {
                      console.warn(error)
                      throw error
                    })
                )
              })
              return arrayPromises
            }

            // Getting dragos balances
            const getDragoBalances = () => {
              let arrayPromises = []
              // Checking if balance return is required
              if (options.balance === false) {
                balances = []
                return arrayPromises
              }
              hexAccounts.map(account => {
                balances[account] = []
                dragoSymbolRegistry.forEach((v, k) => {
                  poolApi.contract.vault.init(k)
                  arrayPromises.push(
                    poolApi.contract.vault
                      .balanceOf(account)
                      .then(dragoBalance => {
                        const {
                          symbol,
                          name,
                          vaultId,
                          address
                        } = dragoSymbolRegistry.get(k)
                        balances[account][vaultId] = {
                          balance: dragoBalance,
                          name: name.trim(),
                          symbol: symbol,
                          vaultId: vaultId,
                          address: address
                        }
                      })
                  )
                })
              })
              return arrayPromises
            }

            // Setting symbol
            // const getSymbols = () => {
            //   let transLogs = dragoTransactionsLogs.map(log => {
            //     const symbol = dragoSymbolRegistry.get(log.params.vault.value)
            //       .symbol
            //     // const vaultId = dragoSymbolRegistry.get(log.params.vault.value).vaultId
            //     // const name = dragoSymbolRegistry.get(log.params.vault.value).name
            //     log.symbol = symbol
            //     return log
            //   })
            //   return transLogs
            // }

            const getTimestamp = logs => {
              return logs.map(log => {
                return api.eth
                  .getBlockByNumber(new BigNumber(log.blockNumber).toFixed(0))
                  .then(block => {
                    log.timestamp = block.timestamp
                    return log
                  })
                  .catch(error => {
                    // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                    // other issues in the app.
                    console.log(error)
                    log.timestamp = new Date(0)
                    return log
                  })
              })
            }

            return Promise.all(getDragoDetails()).then(() => {
              return Promise.all(getDragoSupply()).then(() => {
                return Promise.all(getDragoBalances())
                  .then(() => {
                    if (options.balance) {
                      // Reorganizing the balances array
                      let balancesRegistry = new Map()
                      let tokenBalances = []
                      for (let v in balances) {
                        balances[v].map(balance => {
                          if (balancesRegistry.has(balance.vaultId)) {
                            let dragoBalance = balancesRegistry.get(
                              balance.vaultId
                            ).balance
                            balancesRegistry.set(balance.vaultId, {
                              symbol: balance.symbol,
                              vaultId: balance.vaultId,
                              name: balance.name,
                              balance: dragoBalance.plus(balance.balance)
                            })
                          } else {
                            balancesRegistry.set(balance.vaultId, {
                              symbol: balance.symbol,
                              vaultId: balance.vaultId,
                              name: balance.name,
                              balance: balance.balance
                            })
                          }
                        })
                      }
                      balancesRegistry.forEach((v, k) => {
                        // Filtering empty balances
                        if (balancesRegistry.get(k).balance.gt(0)) {
                          tokenBalances.push({
                            symbol: balancesRegistry.get(k).symbol,
                            name: balancesRegistry.get(k).name,
                            vaultId: balancesRegistry.get(k).vaultId,
                            address: balancesRegistry.get(k).address,
                            balance: formatCoins(
                              balancesRegistry.get(k).balance,
                              4,
                              api
                            )
                          })
                        }
                      })

                      balancesList = tokenBalances
                    }
                  })
                  .then(() => {
                    // let logs = getSymbols()
                    let logs = dragoTransactionsLogs
                    // console.log(
                    //   `***** ${moment().format()} Utils: symbols loaded *****`
                    // )
                    return Promise.all(getTimestamp(logs)).then(logs => {
                      // console.log(
                      //   `***** ${moment().format()} Utils: events timestamp fetched *****`
                      // )
                      balancesList.sort(function(a, b) {
                        if (a.symbol < b.symbol) return -1
                        if (a.symbol > b.symbol) return 1
                        return 0
                      })
                      logs.reverse()
                      supply.sort(function(a, b) {
                        if (a.symbol < b.symbol) return -1
                        if (a.symbol > b.symbol) return 1
                        return 0
                      })
                      let results = [balancesList, logs, supply]
                      return results
                    })
                  })
              })
            })
          })
          .then(results => {
            let endTime = new Date()
            let dif = startTime.getTime() - endTime.getTime()
            let Seconds_from_T1_to_T2 = dif / 1000
            let Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2)
            if (options.trader) {
              console.log(
                `***** ${moment().format()} Utils: ${
                  options.drago ? 'DRAGO' : 'VAULT'
                }${
                  options.allEvents ? ' allEvents ' : ' '
                }Holder transactions loaded in ${Seconds_Between_Dates}s *****`
              )
            } else {
              console.log(
                `***** ${moment().format()} Utils: ${
                  options.drago ? 'DRAGO' : 'VAULT'
                }${
                  options.allEvents ? ' allEvents ' : ' '
                }Manager transactions loaded in ${Seconds_Between_Dates}s *****`
              )
            }
            return results
          })
      })
    })
  }

  /**
   * Get the event logs from a the Drago registry
   * @param  {object} api - The Parity Api
   * @param  {sting} dragoAddress - The drago contract address
   * @param  {array} accounts - The ethereum accounts to filter
   * @param  {object} options - Set the information to return
   * @returns {promise} Promise object represents returning array of balances and transactions
   *
   *
   * This function returns an array of arrays: balances, list of transacions and supply.
   * The parameter options set the arrays to be populated
   * The functions always returns all the arrays. Setting the options will
   * make the function to return an empty array
   *
   * This function can be a performance hit, so it will need to be optimized as much as possible.
   **/
  getTransactionsDragoOptV2 = async (
    api,
    poolAddress,
    accounts = [],
    options = {
      balance: true,
      supply: false,
      limit: 20,
      trader: true,
      drago: true
    }
  ) => {
    //
    // return Promise.reject(new Error('fail'))

    if (poolAddress)
      return this.getTransactionsSingleDrago(
        poolAddress,
        api,
        accounts,
        options
      )
    let startTime = new Date()
    if (accounts.length === 0) {
      return Array(0), Array(0), Array(0)
    }
    const poolApi = new PoolApi(api)
    let dragoSymbolRegistry = new Map()
    let fromBlock
    switch (api._rb.network.id) {
      case 1:
        fromBlock = '6000000'
        break
      case 42:
        fromBlock = '7000000'
        break
      case 3:
        fromBlock = '3000000'
        break
      default:
        '3000000'
    }

    console.log(
      `***** ${moment().format()} Utils: ${
        options.drago ? 'DRAGO' : 'VAULT'
      } events fetching started *****`
    )
    // const logToEvent = log => {
    //   console.log(log)
    //   const key = api.util.sha3(JSON.stringify(log))
    //   // const {
    //   //   blockNumber,
    //   //   logIndex,
    //   //   transactionHash,
    //   //   transactionIndex,
    //   //   params,
    //   //   type
    //   // } = log

    //   const {
    //     address,
    //     blockNumber,
    //     event,
    //     logIndex,
    //     returnValues,
    //     transactionHash,
    //     transactionIndex
    //   } = log

    //   // Getting the transaction amounts if it's a buy or sell event
    //   let ethvalue,
    //     drgvalue = 0

    //   if (
    //     typeof returnValues.amount !== 'undefined' &&
    //     typeof returnValues.revenue !== 'undefined'
    //   ) {
    //     ethvalue =
    //       event === 'BuyDrago'
    //         ? formatEth(returnValues.amount, null, api)
    //         : formatEth(returnValues.revenue, null, api)
    //     drgvalue =
    //       event === 'SellDrago'
    //         ? formatCoins(returnValues.amount, null, api)
    //         : formatCoins(returnValues.revenue, null, api)
    //   }
    //   // Creating a map with list of dragos
    //   if (event === 'BuyDrago' || event === 'DragoCreated') {
    //     const dragoData = {
    //       symbol: returnValues.symbol,
    //       dragoId: null,
    //       name: null,
    //       address: returnValues.drago
    //     }
    //     !dragoSymbolRegistry.has(returnValues.drago)
    //       ? dragoSymbolRegistry.set(returnValues.drago, dragoData)
    //       : null
    //   }
    //   let symbol
    //   if (typeof returnValues.symbol === 'string') {
    //     symbol = returnValues.symbol
    //   } else {
    //     for (let i = 0; i < returnValues.symbol.length; ++i) {
    //       symbol += String.fromCharCode(returnValues.symbol[i])
    //     }
    //   }
    //   return {
    //     address,
    //     type: event,
    //     blockNumber: new BigNumber(blockNumber),
    //     logIndex,
    //     transactionHash,
    //     transactionIndex,
    //     params: returnValues,
    //     key,
    //     ethvalue,
    //     drgvalue,
    //     symbol: symbol
    //   }
    // }

    const logToEvent = log => {
      return this.logToEvent(log, dragoSymbolRegistry, api)
    }
    // Getting all buyDrago and selDrago events since block 0.
    // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
    // to be passed to getAllLogs. Events are indexed and filtered by topics
    // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

    // The second param of the topics array is the drago address
    // The third param of the topics array is the from address
    // The third param of the topics array is the to address
    //
    //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

    let hexAccounts = null
    let hexPoolAddress = null
    if (poolAddress)
      hexPoolAddress = ['0x' + poolAddress.substr(2).padStart(64, '0')]
    // Formatting accounts address
    if (accounts !== null) {
      hexAccounts = accounts.map(account => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
        return hexAccount
      })
    }

    const getPoolsFromOwner = async () => {
      let arrayPromises = accounts.map(async account => {
        await poolApi.contract.dragofactory.init()
        const poolsList = await poolApi.contract.dragofactory
          .getDragosByAddress(account.address)
          .then(results => {
            return results
          })
          .catch(error => {
            console.warn(error)
            throw error
          })
        poolsList.forEach(v => {
          const dragoData = {
            symbol: null,
            dragoId: null,
            name: null,
            address: v.value
          }
          !dragoSymbolRegistry.has(v.value)
            ? dragoSymbolRegistry.set(v.value, dragoData)
            : null
        })
        return poolsList
      })

      return Promise.all(arrayPromises)
    }

    if (options.trader) {
    } else {
      await getPoolsFromOwner()
    }
    // Initializing the eventful contract
    return poolApi.contract.dragoregistry.init().then(() => {
      return poolApi.contract.dragoeventful.init().then(() => {
        const getChunkedEvents = topics => {
          let arrayPromises = []
          return api.eth.blockNumber().then(lastBlock => {
            let chunck = 100000
            const chunks = this.blockChunks(fromBlock, lastBlock, chunck)
            arrayPromises = chunks.map(async chunk => {
              // Pushing chunk logs into array
              let options = {
                topics: topics,
                fromBlock: chunk.fromBlock,
                toBlock: chunk.toBlock
              }
              return await poolApi.contract.dragoeventful.getAllLogs(options)
            })

            return Promise.all(arrayPromises).then(results => {
              let dragoTransactionsLog = Array(0).concat(...results)
              const logs = dragoTransactionsLog.map(logToEvent)
              return logs
            })
          })
        }

        let eventSig
        eventSig = options.drago
          ? [
              poolApi.contract.dragoeventful.hexSignature.BuyDrago,
              poolApi.contract.dragoeventful.hexSignature.SellDrago
            ]
          : [
              poolApi.contract.vaulteventful.hexSignature.BuyVault,
              poolApi.contract.vaulteventful.hexSignature.SellVault
            ]

        let topicsBuySell = [eventSig, hexPoolAddress, hexAccounts, null]

        eventSig = options.drago
          ? [poolApi.contract.dragoeventful.hexSignature.DragoCreated]
          : [poolApi.contract.vaulteventful.hexSignature.VaultCreated]

        let topicsCreate = [eventSig, null, null, hexAccounts]

        let promisesEvents = null

        options.trader
          ? (promisesEvents = [getChunkedEvents(topicsBuySell)])
          : (promisesEvents = [getChunkedEvents(topicsCreate)])

        return Promise.all(promisesEvents)
          .then(results => {
            let allLogs = [...results[0]]
            // Creating an array of promises that will be executed to add timestamp and symbol to each entry
            // Doing so because for each entry we need to make an async call to the client
            // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
            // console.log(results)

            function compare(a, b) {
              // Use toUpperCase() to ignore character casing
              const blocklNumberA = a.blockNumber
              const blocklNumberB = b.blockNumber

              let comparison = 0
              if (blocklNumberA.gt(blocklNumberB)) {
                comparison = 1
              } else if (blocklNumberA.lt(blocklNumberB)) {
                comparison = -1
              }
              return comparison
            }
            let supply = []
            let balances = []
            let balancesList = []
            allLogs.sort(compare)
            let dragoTransactionsLogs = allLogs.slice(
              allLogs.length - options.limit,
              allLogs.length
            )

            // This is an inefficient way to get the symbol for each transactions.
            // In the future the symbol will have to be saved in the eventful logs.
            const getDragoDetails = () => {
              let arrayPromises = []
              dragoSymbolRegistry.forEach((v, k) => {
                arrayPromises.push(
                  poolApi.contract.dragoregistry
                    .fromAddress(k)
                    .then(dragoDetails => {
                      const dragoData = {
                        symbol: dragoDetails[2].trim(),
                        dragoId: dragoDetails[3].toFixed(),
                        name: dragoDetails[1].trim(),
                        address: k.trim()
                      }

                      dragoSymbolRegistry.set(k, dragoData)
                      return dragoDetails
                    })
                    .catch(error => {
                      console.warn(error)
                      throw error
                    })
                )
              })
              return arrayPromises
            }

            // Getting dragos supply
            const getDragoSupply = () => {
              let arrayPromises = []
              if (options.supply === false) {
                supply = []
                return arrayPromises
              }
              dragoSymbolRegistry.forEach((v, k) => {
                poolApi.contract.drago.init(k)
                arrayPromises.push(
                  poolApi.contract.drago
                    .totalSupply()
                    .then(dragoSupply => {
                      const {
                        symbol,
                        name,
                        dragoId,
                        address
                      } = dragoSymbolRegistry.get(k)
                      supply.push({
                        supply: formatCoins(new BigNumber(dragoSupply), 4, api),
                        name: name.trim(),
                        symbol: symbol,
                        dragoId: dragoId,
                        address: address
                      })
                    })
                    .catch(error => {
                      console.warn(error)
                      throw error
                    })
                )
              })
              return arrayPromises
            }

            // Getting dragos balances
            const getDragoBalances = () => {
              let arrayPromises = []
              // Checking if balance return is required
              if (options.balance === false) {
                balances = []
                return arrayPromises
              }
              hexAccounts.map(account => {
                balances[account] = []
                dragoSymbolRegistry.forEach((v, k) => {
                  poolApi.contract.drago.init(k)
                  arrayPromises.push(
                    poolApi.contract.drago
                      .balanceOf(account)
                      .then(dragoBalance => {
                        const {
                          symbol,
                          name,
                          dragoId,
                          address
                        } = dragoSymbolRegistry.get(k)
                        balances[account][dragoId] = {
                          balance: dragoBalance,
                          name: name.trim(),
                          symbol: symbol,
                          dragoId: dragoId,
                          address: address
                        }
                      })
                  )
                })
              })
              return arrayPromises
            }

            // // Setting symbol
            // const getSymbols = () => {
            //   let transLogs = dragoTransactionsLogs.map(log => {
            //     if (typeof dragoSymbolRegistry.get(log.params.drago.value) !== 'undefined') {
            //       const symbol = dragoSymbolRegistry.get(log.params.drago.value)
            //       .symbol
            //     // const dragoId = dragoSymbolRegistry.get(log.params.drago.value).dragoId
            //     // const name = dragoSymbolRegistry.get(log.params.drago.value).name
            //     log.symbol = symbol
            //     }

            //     return log
            //   })
            //   return transLogs
            // }

            const getTimestamp = logs => {
              return logs.map(log => {
                return api.eth
                  .getBlockByNumber(new BigNumber(log.blockNumber).toFixed(0))
                  .then(block => {
                    log.timestamp = block.timestamp
                    return log
                  })
                  .catch(() => {
                    // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                    // other issues in the app.
                    log.timestamp = new Date(0)
                    return log
                  })
              })
            }

            return Promise.all(getDragoDetails()).then(() => {
              return Promise.all(getDragoSupply()).then(() => {
                return Promise.all(getDragoBalances())
                  .then(() => {
                    if (options.balance) {
                      // Reorganizing the balances array
                      let balancesRegistry = new Map()
                      let tokenBalances = []
                      for (let v in balances) {
                        balances[v].map(balance => {
                          if (balancesRegistry.has(balance.dragoId)) {
                            let dragoBalance = balancesRegistry.get(
                              balance.dragoId
                            ).balance
                            balancesRegistry.set(balance.dragoId, {
                              symbol: balance.symbol,
                              dragoId: balance.dragoId,
                              name: balance.name,
                              address: balance.address,
                              balance: dragoBalance.plus(balance.balance)
                            })
                          } else {
                            balancesRegistry.set(balance.dragoId, {
                              symbol: balance.symbol,
                              dragoId: balance.dragoId,
                              name: balance.name,
                              address: balance.address,
                              balance: balance.balance
                            })
                          }
                        })
                      }
                      balancesRegistry.forEach((v, k) => {
                        // Filtering empty balances
                        if (balancesRegistry.get(k).balance.gt(0)) {
                          tokenBalances.push({
                            symbol: balancesRegistry.get(k).symbol,
                            name: balancesRegistry.get(k).name,
                            dragoId: balancesRegistry.get(k).dragoId,
                            address: balancesRegistry.get(k).address,
                            balance: formatCoins(
                              balancesRegistry.get(k).balance,
                              4,
                              api
                            )
                          })
                        }
                      })
                      balancesList = tokenBalances
                    }
                  })
                  .then(() => {
                    let logs = dragoTransactionsLogs
                    // console.log(
                    //   `***** ${moment().format()} Utils: symbols loaded *****`
                    // )
                    return Promise.all(getTimestamp(logs)).then(logs => {
                      // console.log(
                      //   `***** ${moment().format()} Utils: events timestamp fetched *****`
                      // )
                      balancesList.sort(function(a, b) {
                        if (a.symbol < b.symbol) return -1
                        if (a.symbol > b.symbol) return 1
                        return 0
                      })
                      logs.reverse()
                      supply.sort(function(a, b) {
                        if (a.symbol < b.symbol) return -1
                        if (a.symbol > b.symbol) return 1
                        return 0
                      })
                      let results = [balancesList, logs, supply]
                      return results
                    })
                  })
              })
            })
          })
          .then(results => {
            let endTime = new Date()
            let dif = startTime.getTime() - endTime.getTime()
            let Seconds_from_T1_to_T2 = dif / 1000
            let Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2)
            if (options.trader) {
              console.log(
                `***** ${moment().format()} Utils: ${
                  options.drago ? 'DRAGO' : 'VAULT'
                } Holder transactions loaded in ${Seconds_Between_Dates}s *****`
              )
            } else {
              console.log(
                `***** ${moment().format()} Utils: ${
                  options.drago ? 'DRAGO' : 'VAULT'
                } Manager transactions loaded in ${Seconds_Between_Dates}s *****`
              )
            }
            return results
          })
      })
    })
  }

  getTransactionsSingleDrago = async (dragoAddress, api, accounts, options) => {
    const poolApi = new PoolApi(api)
    await poolApi.contract.dragoeventful.init()
    const contract = poolApi.contract.dragoeventful
    let fromBlock
    switch (api._rb.network.id) {
      case 1:
        fromBlock = '6000000'
        break
      case 42:
        fromBlock = '7000000'
        break
      case 3:
        fromBlock = '3000000'
        break
      default:
        '3000000'
    }

    const logToEvent = log => {
      const key = api.util.sha3(JSON.stringify(log))
      const {
        address,
        blockNumber,
        event,
        logIndex,
        returnValues,
        transactionHash,
        transactionIndex
      } = log

      const hexToString = hex => {
        let string = ''
        for (let i = 0; i < hex.length; i += 2) {
          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
        return string
      }

      let ethvalue,
        drgvalue = 0

      if (
        typeof returnValues.amount !== 'undefined' &&
        typeof returnValues.revenue !== 'undefined'
      ) {
        ethvalue =
          event === 'BuyDrago'
            ? formatEth(returnValues.amount, null, api)
            : formatEth(returnValues.revenue, null, api)
        drgvalue =
          event === 'SellDrago'
            ? formatCoins(returnValues.amount, null, api)
            : formatCoins(returnValues.revenue, null, api)
      }
      let symbol
      if (typeof returnValues.symbol === 'string') {
        '0x' === returnValues.symbol.substring(0, 2)
          ? (symbol = hexToString(returnValues.symbol.substring(2)))
          : (symbol = returnValues.symbol)
      } else {
        for (let i = 0; i < returnValues.symbol.length; ++i) {
          symbol += String.fromCharCode(returnValues.symbol[i])
        }
      }
      return {
        address,
        type: event,
        blockNumber: new BigNumber(blockNumber),
        logIndex,
        transactionHash,
        transactionIndex,
        params: returnValues,
        key,
        ethvalue,
        drgvalue,
        symbol: symbol
      }
    }

    // Getting all buyDrago and selDrago events since block 0.
    // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
    // to be passed to getAllLogs. Events are indexed and filtered by topics
    // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

    // The second param of the topics array is the drago address
    // The third param of the topics array is the from address
    // The third param of the topics array is the to address
    //
    //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

    const hexPoolAddress = '0x' + dragoAddress.substr(2).padStart(64, '0')
    const hexAccounts = accounts.map(account => {
      const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
      return hexAccount
    })

    const getChunkedEvents = topics => {
      let arrayPromises = []
      return api.eth.blockNumber().then(lastBlock => {
        let chunck = 100000
        const chunks = this.blockChunks(fromBlock, lastBlock, chunck)
        arrayPromises = chunks.map(async chunk => {
          // Pushing chunk logs into array
          let options = {
            topics: topics,
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          }
          return await poolApi.contract.dragoeventful.getAllLogs(options)
        })

        return Promise.all(arrayPromises).then(results => {
          let logs = [].concat(...results)
          return logs.map(logToEvent)
        })
      })
    }

    let eventsFilterBuySell

    if (options.trader) {
      console.log('trader transactions')
      eventsFilterBuySell = [
        [contract.hexSignature.BuyDrago, contract.hexSignature.SellDrago],
        [hexPoolAddress],
        hexAccounts,
        null
      ]
    } else {
      console.log('manager transactions')
      eventsFilterBuySell = [
        [
          contract.hexSignature.BuyDrago,
          contract.hexSignature.SellDrago,
          contract.hexSignature.DragoCreated
        ],
        [hexPoolAddress],
        null,
        null
      ]
    }

    let promisesEvents = [getChunkedEvents(eventsFilterBuySell)]

    // const buyDragoEvents = contract
    //   .getAllLogs(eventsFilterBuy)
    //   .then(dragoTransactionsLog => {
    //     const buyLogs = dragoTransactionsLog.map(logToEvent)
    //     return buyLogs
    //   })
    // const sellDragoEvents = contract
    //   .getAllLogs(eventsFilterSell)
    //   .then(dragoTransactionsLog => {
    //     const sellLogs = dragoTransactionsLog.map(logToEvent)
    //     return sellLogs
    //   })
    return Promise.all(promisesEvents)
      .then(logs => {
        return logs[0]
      })
      .then(dragoTransactionsLog => {
        // Creating an array of promises that will be executed to add timestamp to each entry
        // Doing so because for each entry we need to make an async call to the client
        // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
        let promises = dragoTransactionsLog.map(log => {
          return api.eth
            .getBlockByNumber(new BigNumber(log.blockNumber).toFixed(0))
            .then(block => {
              log.timestamp = block.timestamp
              return log
            })
            .catch(error => {
              // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
              // other issues in the app.
              console.log(error)
              log.timestamp = new Date()
              return log
            })
        })
        return Promise.all(promises).then(results => {
          results.sort(function(x, y) {
            return y.timestamp - x.timestamp
          })
          // this.props.dispatch(
          //   Actions.drago.updateSelectedDrago({
          //     transactions: results
          //   })
          // )
          console.log(
            `${
              this.constructor.name
            } -> getTransactionsSingleDrago: Transactions list loaded`
          )
          return results
        })
      })
  }

  getTransactionsSingleVault = async (poolAddress, api, accounts, options) => {
    const poolApi = new PoolApi(api)
    await poolApi.contract.vaulteventful.init()
    const contract = poolApi.contract.vaulteventful
    let fromBlock
    switch (api._rb.network.id) {
      case 1:
        fromBlock = '6000000'
        break
      case 42:
        fromBlock = '7000000'
        break
      case 3:
        fromBlock = '3000000'
        break
      default:
        '3000000'
    }

    const logToEvent = log => {
      const key = api.util.sha3(JSON.stringify(log))
      const {
        address,
        blockNumber,
        event,
        logIndex,
        returnValues,
        transactionHash,
        transactionIndex
      } = log

      const hexToString = hex => {
        let string = ''
        for (let i = 0; i < hex.length; i += 2) {
          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
        return string
      }

      let ethvalue,
        drgvalue = 0

      if (
        typeof returnValues.amount !== 'undefined' &&
        typeof returnValues.revenue !== 'undefined'
      ) {
        ethvalue =
          event === 'BuyVault'
            ? formatEth(returnValues.amount, null, api)
            : formatEth(returnValues.revenue, null, api)
        drgvalue =
          event === 'SellVault'
            ? formatCoins(returnValues.amount, null, api)
            : formatCoins(returnValues.revenue, null, api)
      }
      let symbol
      if (typeof returnValues.symbol === 'string') {
        '0x' === returnValues.symbol.substring(0, 2)
          ? (symbol = hexToString(returnValues.symbol.substring(2)))
          : (symbol = returnValues.symbol)
      } else {
        for (let i = 0; i < returnValues.symbol.length; ++i) {
          symbol += String.fromCharCode(returnValues.symbol[i])
        }
      }
      return {
        address,
        type: event,
        blockNumber: new BigNumber(blockNumber),
        logIndex,
        transactionHash,
        transactionIndex,
        params: returnValues,
        key,
        ethvalue,
        drgvalue,
        symbol: symbol
      }
    }

    // Getting all BuyVault and selDrago events since block 0.
    // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
    // to be passed to getAllLogs. Events are indexed and filtered by topics
    // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

    // The second param of the topics array is the drago address
    // The third param of the topics array is the from address
    // The third param of the topics array is the to address
    //
    //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

    const hexPoolAddress = '0x' + poolAddress.substr(2).padStart(64, '0')
    const hexAccounts = accounts.map(account => {
      const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
      return hexAccount
    })

    const getChunkedEvents = topics => {
      let arrayPromises = []
      return api.eth.blockNumber().then(lastBlock => {
        let chunck = 100000
        const chunks = this.blockChunks(fromBlock, lastBlock, chunck)
        arrayPromises = chunks.map(async chunk => {
          // Pushing chunk logs into array
          let options = {
            topics: topics,
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          }
          return await poolApi.contract.vaulteventful.getAllLogs(options)
        })

        return Promise.all(arrayPromises).then(results => {
          let logs = [].concat(...results)
          return logs.map(logToEvent)
        })
      })
    }

    let eventsFilterBuySell

    if (options.trader) {
      console.log('trader transactions')
      eventsFilterBuySell = [
        [contract.hexSignature.BuyVault, contract.hexSignature.SellVault],
        [hexPoolAddress],
        hexAccounts,
        null
      ]
    } else {
      console.log('manager transactions')
      eventsFilterBuySell = [
        [
          contract.hexSignature.BuyVault,
          contract.hexSignature.SellVault,
          contract.hexSignature.VaultCreated
        ],
        [hexPoolAddress],
        null,
        null
      ]
    }

    let promisesEvents = [getChunkedEvents(eventsFilterBuySell)]

    // const BuyVaultEvents = contract
    //   .getAllLogs(eventsFilterBuy)
    //   .then(logs => {
    //     const buyLogs = logs.map(logToEvent)
    //     return buyLogs
    //   })
    // const SellVaultEvents = contract
    //   .getAllLogs(eventsFilterSell)
    //   .then(logs => {
    //     const sellLogs = logs.map(logToEvent)
    //     return sellLogs
    //   })
    return Promise.all(promisesEvents)
      .then(logs => {
        console.log('getTransactionsSingleVault', logs)
        return logs[0]
      })
      .then(logs => {
        // Creating an array of promises that will be executed to add timestamp to each entry
        // Doing so because for each entry we need to make an async call to the client
        // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
        let promises = logs.map(log => {
          return api.eth
            .getBlockByNumber(new BigNumber(log.blockNumber).toFixed(0))
            .then(block => {
              log.timestamp = block.timestamp
              return log
            })
            .catch(error => {
              // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
              // other issues in the app.
              console.log(error)
              log.timestamp = new Date()
              return log
            })
        })
        return Promise.all(promises).then(results => {
          results.sort(function(x, y) {
            return y.timestamp - x.timestamp
          })
          console.log(
            `${
              this.constructor.name
            } -> Single Vault Transactions list loaded: trader ${
              options.trader
            }`
          )
          console.log(results)
          return results
        })
      })
  }

  getPoolDetailsFromId = async (dragoId, api) => {
    const poolApi = new PoolApi(api)
    await poolApi.contract.dragoregistry.init()
    const dragoDetails = await poolApi.contract.dragoregistry.fromId(dragoId)
    return dragoDetails
  }

  getDragoDetails = async (dragoDetails, accounts, api) => {
    //
    // Initializing Drago API
    // Passing Parity API
    //
    const poolApi = new PoolApi(api)
    const dragoAddress = dragoDetails[0][0]
    let fromBlock
    switch (api._rb.network.id) {
      case 1:
        fromBlock = '6000000'
        break
      case 42:
        fromBlock = '7000000'
        break
      case 3:
        fromBlock = '3000000'
        break
      default:
        '3000000'
    }
    //
    // Getting last transactions
    //
    await poolApi.contract.dragoeventful.init()

    //
    // Initializing drago contract
    //
    await poolApi.contract.drago.init(dragoAddress)

    //
    // Gettind drago data, creation date, supply, ETH balances
    //

    const getDragoCreationDate = async address => {
      const hexPoolAddress = '0x' + address.substr(2).padStart(64, '0')

      let topics = [
        [poolApi.contract.dragoeventful.hexSignature.DragoCreated],
        [hexPoolAddress],
        null,
        null
      ]

      let arrayPromises = []
      return api.eth.blockNumber().then(lastBlock => {
        let chunck = 100000
        const chunks = this.blockChunks(fromBlock, lastBlock, chunck)
        arrayPromises = chunks.map(async chunk => {
          // Pushing chunk logs into array
          let options = {
            topics: topics,
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          }
          return await poolApi.contract.dragoeventful.getAllLogs(options)
        })

        return Promise.all(arrayPromises)
          .then(results => {
            let logs = [].concat(...results)
            if (logs.length !== 0) {
              return api.eth
                .getBlockByNumber(logs[0].blockNumber.toFixed(0))
                .then(result => {
                  return this.dateFromTimeStampHuman(result.timestamp)
                })
            } else {
              return this.dateFromTimeStampHuman(new Date(0))
            }
          })
          .catch(error => {
            console.warn(error)
            throw Error(error)
          })
      })
    }

    const dragoData = await poolApi.contract.drago.getData()
    const dragoCreatedDate = await getDragoCreationDate(dragoAddress)
    const dragoTotalSupply = await poolApi.contract.drago.totalSupply()
    const dragoETHBalance = await formatEth(
      await poolApi.contract.drago.getBalance(),
      5,
      api
    )
    const dragoWETHBalance = await formatEth(
      await poolApi.contract.drago.getBalanceWETH(),
      5,
      api
    )
    let details = {
      address: dragoDetails[0][0],
      name:
        dragoDetails[0][1].charAt(0).toUpperCase() +
        dragoDetails[0][1].slice(1),
      symbol: dragoDetails[0][2],
      dragoId: dragoDetails[0][3].toFixed(),
      addressOwner: dragoDetails[0][4],
      addressGroup: dragoDetails[0][5],
      sellPrice: api.util.fromWei(dragoData[2].toNumber(4)).toFormat(4),
      buyPrice: api.util.fromWei(dragoData[3].toNumber(4)).toFormat(4),
      created: dragoCreatedDate,
      totalSupply: formatCoins(new BigNumber(dragoTotalSupply), 4, api),
      dragoETHBalance,
      dragoWETHBalance
    }

    //
    // Getting balance for each user account
    //
    let balanceDRG = new BigNumber(0)
    await Promise.all(
      accounts.map(async account => {
        const balance = await poolApi.contract.drago.balanceOf(account.address)
        balanceDRG = balanceDRG.plus(balance)
      })
    )
    balanceDRG = formatCoins(balanceDRG, 4, api)
    details = { ...details, balanceDRG }
    return details
  }

  getVaultDetails = async (vaultDetails, accounts, api) => {
    //
    // Initializing vault API
    // Passing Parity API
    //
    const poolApi = new PoolApi(api)
    const vaultAddress = vaultDetails[0][0]
    let fromBlock
    switch (api._rb.network.id) {
      case 1:
        fromBlock = '6000000'
        break
      case 42:
        fromBlock = '7000000'
        break
      case 3:
        fromBlock = '3000000'
        break
      default:
        '3000000'
    }
    //
    // Getting last transactions
    //
    await poolApi.contract.vaulteventful.init()

    //
    // Initializing vault contract
    //
    await poolApi.contract.vault.init(vaultAddress)

    //
    // Gettind vault data, creation date, supply, ETH balances
    //

    const getVaultCreationDate = async address => {
      const hexPoolAddress = '0x' + address.substr(2).padStart(64, '0')

      let topics = [
        [poolApi.contract.vaulteventful.hexSignature.VaultCreated],
        [hexPoolAddress],
        null,
        null
      ]

      let arrayPromises = []
      return api.eth.blockNumber().then(lastBlock => {
        let chunck = 100000
        const chunks = this.blockChunks(fromBlock, lastBlock, chunck)
        arrayPromises = chunks.map(async chunk => {
          // Pushing chunk logs into array
          let options = {
            topics: topics,
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          }
          return await poolApi.contract.vaulteventful.getAllLogs(options)
        })

        return Promise.all(arrayPromises)
          .then(results => {
            let logs = [].concat(...results)
            if (logs.length !== 0) {
              return api.eth
                .getBlockByNumber(logs[0].blockNumber.toFixed(0))
                .then(result => {
                  return this.dateFromTimeStampHuman(result.timestamp)
                })
            } else {
              return this.dateFromTimeStampHuman(new Date(0))
            }
          })
          .catch(error => {
            console.warn(error)
            throw Error(error)
          })
      })
    }

    const vaultData = await poolApi.contract.vault.getData()
    const vaultAdminData = await poolApi.contract.vault.getAdminData()
    const vaultCreatedDate = await getVaultCreationDate(
      vaultAddress,
      poolApi.contract.vaulteventful
    )
    const vaultTotalSupply = await poolApi.contract.vault.totalSupply()
    const vaultETHBalance = await formatEth(
      await poolApi.contract.vault.getBalance(),
      5,
      api
    )
    const fee = new BigNumber(vaultAdminData[4]).div(100).toFixed(2)

    let details = {
      address: vaultDetails[0][0],
      name:
        vaultDetails[0][1].charAt(0).toUpperCase() +
        vaultDetails[0][1].slice(1),
      symbol: vaultDetails[0][2],
      vaultId: new BigNumber(vaultDetails[0][3]).toNumber(),
      addressOwner: vaultDetails[0][4],
      addressGroup: vaultDetails[0][5],
      sellPrice: api.util.fromWei(vaultData[2].toNumber(4)).toFormat(4),
      buyPrice: api.util.fromWei(vaultData[3].toNumber(4)).toFormat(4),
      created: vaultCreatedDate,
      totalSupply: formatCoins(new BigNumber(vaultTotalSupply), 4, api),
      vaultETHBalance,
      fee
    }

    //
    // Getting balance for each user account
    //
    let balanceDRG = new BigNumber(0)
    await Promise.all(
      accounts.map(async account => {
        const balance = await poolApi.contract.vault.balanceOf(account.address)
        balanceDRG = balanceDRG.plus(balance)
      })
    )
    balanceDRG = formatCoins(balanceDRG, 4, api)
    details = { ...details, balanceDRG }
    return details
  }

  updateTokenWrapperLockTime = async (api, tokenAddress, accountAddress) => {
    const poolApi = new PoolApi(api)
    await poolApi.contract.tokenwrapper.init(tokenAddress)
    return (await poolApi.contract.tokenwrapper.depositLock(
      accountAddress
    )).toFixed()
  }

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

  fetchDragoLiquidityAndTokenBalances = async (
    dragoAddress,
    api,
    selectedTokensPair,
    exchange
  ) => {
    let provider = api
    const poolApi = new PoolApi(provider)
    poolApi.contract.drago.init(dragoAddress)
    let {
      baseTokenLockWrapExpire,
      quoteTokenLockWrapExpire
    } = selectedTokensPair
    let dragoETHBalance = await poolApi.contract.drago.getBalance()
    // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),
    let baseTokenBalance = await (selectedTokensPair.baseToken.address !== '0x0'
      ? await poolApi.contract.drago.getBalanceToken(
          selectedTokensPair.baseToken.address
        )
      : await poolApi.contract.drago.getBalance())

    let quoteTokenBalance = await (selectedTokensPair.quoteToken.address !==
    '0x0'
      ? await poolApi.contract.drago.getBalanceToken(
          selectedTokensPair.quoteToken.address
        )
      : await poolApi.contract.drago.getBalance())

    let baseTokenWrapperBalance, quoteTokenWrapperBalance = new BigNumber(0)
    if (exchange.isTokenWrapper) {

      // Getting token wrapper balance
      baseTokenWrapperBalance = await poolApi.contract.drago.getBalanceToken(
        selectedTokensPair.baseToken.wrappers[exchange.name].address
      )
      quoteTokenWrapperBalance = await poolApi.contract.drago.getBalanceToken(
        selectedTokensPair.quoteToken.wrappers[exchange.name].address
      )
      // Getting token wrapper lock time
      baseTokenLockWrapExpire = await utils.updateTokenWrapperLockTime(
        api,
        selectedTokensPair.baseToken.wrappers[exchange.name].address,
        dragoAddress
      )
      // console.log(
      //   `Exp base token: ${moment
      //     .unix(baseTokenLockWrapExpire)
      //     .format('MMMM Do YYYY, h:mm:ss a')}`
      // )
      quoteTokenLockWrapExpire = await utils.updateTokenWrapperLockTime(
        api,
        selectedTokensPair.quoteToken.wrappers[exchange.name].address,
        dragoAddress
      )
    //   console.log(
    //   `Exp quote token: ${moment
    //     .unix(quoteTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    }
    const liquidity = {
      dragoETHBalance,
      // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),
      baseTokenBalance,
      baseTokenWrapperBalance,
      quoteTokenBalance,
      quoteTokenWrapperBalance,
      baseTokenLockWrapExpire,
      quoteTokenLockWrapExpire
    }
    // console.log(liquidity)
    return liquidity
  }

  shallowEqual(objA, objB, component = '') {
    //
    if (objA === objB) {
      // console.log(`${this.constructor.name} -> objA === objB -> ${component}`)
      return true
    }

    if (
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null
    ) {
      // console.log(`${this.constructor.name} -> objA !== 'object' -> ${component}`)
      return false
    }

    let keysA = Object.keys(objA)
    let keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
      // console.log(`${this.constructor.name} -> keysA.length  -> ${component}`)
      return false
    }

    // Test for A's keys different from B.
    let bHasOwnProperty = hasOwnProperty.bind(objB)
    for (let i = 0; i < keysA.length; i++) {
      if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        // console.log(objA[keysA[i]], objB[keysA[i]])
        // console.log(
        //   `${this.constructor.name} -> Test for A's keys different from B  -> ${component}`
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
