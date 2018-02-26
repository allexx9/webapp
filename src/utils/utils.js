import { DRG_ISIN } from './const';
import { formatCoins, formatEth } from '../format';
import { APP, DS } from './const.js'
import BigNumber from 'bignumber.js'
import DragoApi from '../DragoApi/src'

class utilities {

  isManager = () => {
    const isManagerSelected = localStorage.getItem('isManager')
    var isManager = false
    // Checking account type (trader/manager) and restoring after browser refresh
    if (typeof isManagerSelected !== 'undefined') {
      switch (isManagerSelected) {
        case 'false':
          isManager = false
          break;
        case 'true':
          isManager = true
          break;
        default:
          isManager = false
      }
    } else {
      isManager = false
    }
    return isManager
  }

  dateFromTimeStamp = (timestamp) => {
    const day = ("0" + timestamp.getDate()).slice(-2)
    const month = ("0" + (timestamp.getMonth() + 1)).slice(-2)
    function addZero(i) {
      return (i < 10) ? "0" + i : i;
    }
    return timestamp.getFullYear() + '-' + month + '-' + day + ' ' + addZero(timestamp.getHours()) + ':' + addZero(timestamp.getMinutes()) + ':' + addZero(timestamp.getSeconds())
  }

  // This funcions needs to be rewritten to work async.
  updateTransactionsQueue = (api, recentTransactions) => {
    var checkTransaction = true
    var shouldTransactionListUpdate = false
    var newRecentTransactions = new Map(recentTransactions)
    newRecentTransactions.forEach((value, key, map) => {
      if (value.status === 'executed' || value.status === 'error') {
        return
      }
      // 1.1 Checking if it's a transaction belonging to a Parity account
      console.log(value.parityId)
      if (value.parityId) {
        // 1.2 Checking if the transaction has been accepted (it has got an blockNumber)
        console.log(`Checking if blockhash undefined`)
        if (typeof value.receipt !== 'undefined') {
          console.log(value.receipt.blockNumber)
          // 1.3 Checing if it has blocknumber. It it has it, then no need to proceed further.
          value.receipt.blockNumber.eq(0) ? checkTransaction = true : checkTransaction = false
        }
        if (!checkTransaction) {
          return null
        }
        console.log(`Checking request on Parity wallet`)
        api.parity.checkRequest(value.parityId, [])
          .then(hash => {
            console.log(hash)
            if (hash) {
              value.hash = hash
              api.eth.getTransactionByHash(hash)
                .then(receipt => {
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

  getTransactionsVaultOpt = (api, dragoAddress, accounts, options = { balance: true, supply: false, limit: 20, trader: true }) => {
    const sourceLogClass = this.constructor.name
    var resultsAll = null
    const dragoApi = new DragoApi(api)
    var ethvalue = 0
    var drgvalue = 0
    var dragoSymbolRegistry = new Map()
    // console.log(options)
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      // console.log(log)
      if (typeof params.amount !== 'undefined') {
        ethvalue = (log.event === 'BuyGabcoin') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
        drgvalue = (log.event === 'SellGabcoin') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
      }
      console.log(log)
      if (log.event === 'BuyGabcoin' || log.event === 'GabcoinCreated') {
        !dragoSymbolRegistry.has(params.gabcoin.value) ? dragoSymbolRegistry.set(params.gabcoin.value, { symbol: null, dragoID: null, name: null }) : null
      }
      // console.log(dragoSymbolRegistry)

      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params,
        key,
        ethvalue,
        drgvalue
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

    // const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
    var hexAccounts = null

    var balances = null
    // Formatting accounts address
    if (accounts !== null) {
      hexAccounts = accounts.map((account) => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
        return hexAccount
      })
    }

    // Initializing the eventful contract
    return dragoApi.contract.vaulteventful.init()
      .then(() => {
        // Filter for create events
        const eventsFilterCreate = {
          topics: [
            [dragoApi.contract.vaulteventful.hexSignature.GabcoinCreated],
            null,
            null,
            hexAccounts
          ]
        }
        // Filter for buy events
        const eventsFilterBuy = {
          topics: [
            [dragoApi.contract.vaulteventful.hexSignature.BuyGabcoin],
            null,
            hexAccounts,
            null
          ]
        }
        // Filter for sell events
        const eventsFilterSell = {
          topics: [
            [dragoApi.contract.vaulteventful.hexSignature.SellGabcoin],
            null,
            null,
            hexAccounts
          ]
        }

        const createDragoEvents = () => {
          return dragoApi.contract.vaulteventful
            .getAllLogs(eventsFilterCreate)
            .then((dragoTransactionsLog) => {
              const createLogs = dragoTransactionsLog.map(logToEvent)
              return createLogs
            }
            )
        }

        const buyDragoEvents = () => {
          return dragoApi.contract.vaulteventful
            .getAllLogs(eventsFilterBuy)
            .then((dragoTransactionsLog) => {
              const buyLogs = dragoTransactionsLog.map(logToEvent)
              return buyLogs
            }
            )
        }

        const sellDragoEvents = () => {
          return dragoApi.contract.vaulteventful
            .getAllLogs(eventsFilterSell)
            .then((dragoTransactionsLog) => {
              const sellLogs = dragoTransactionsLog.map(logToEvent)
              return sellLogs
            }
            )
        }

        var promisesEvents = null
        if (options.trader) {
          promisesEvents = [buyDragoEvents(), sellDragoEvents()]
        } else {
          promisesEvents = [createDragoEvents()]
        }
        return Promise.all(promisesEvents)
          .then((results) => {
            // Creating an array of promises that will be executed to add timestamp and symbol to each entry
            // Doing so because for each entry we need to make an async call to the client
            // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
            // console.log(results)
            var dragoTransactionsLog = options.trader ? [...results[0], ...results[1]] : [...results[0]]
            // dragoTransactionsLog.filter(function(val) { return val !== null; })
            var dragoBalances = []
            var supply = []

            // This is an inefficient way to get the symbol for each transactions. 
            // In the future the symbol will have to be saved in the eventful logs.
            const getDragoDetails = () => {
              var arrayPromises = []
              dragoSymbolRegistry.forEach((v, k) => {
                arrayPromises.push(
                  dragoApi.contract.dragoregistry.init()
                    .then(() => {
                      return dragoApi.contract.dragoregistry.fromAddress(k)
                        .then((dragoDetails) => {
                          console.log(dragoDetails)
                          dragoSymbolRegistry.set(k, { symbol: dragoDetails[2].trim(), dragoID: dragoDetails[3].toFixed(), name: dragoDetails[1].trim() })
                        }
                        )
                    }
                    )
                )
              }
              )
              return arrayPromises
            }

            // Getting dragos supply
            const getDragoSupply = () => {
              var arrayPromises = []
              if (options.supply === false) {
                supply = []
                return arrayPromises
              }
              dragoSymbolRegistry.forEach((v, k) => {
                dragoApi.contract.drago.init(k)
                arrayPromises.push(
                  dragoApi.contract.drago.totalSupply()
                    .then((dragoSupply) => {
                      const symbol = dragoSymbolRegistry.get(k).symbol
                      const name = dragoSymbolRegistry.get(k).name.trim()
                      const dragoID = dragoSymbolRegistry.get(k).dragoID
                      supply.push({
                        supply: formatCoins(new BigNumber(dragoSupply), 4, api),
                        name,
                        symbol: symbol,
                        dragoID: dragoID
                      })
                    }
                    )
                )
              }
              )
              return arrayPromises
            }

            // Setting symbol and calculating balance
            const setSymbolAndBalance = () => {
              var transLogs = dragoTransactionsLog.map((log) => {
                const symbol = dragoSymbolRegistry.get(log.params.gabcoin.value).symbol
                const dragoID = dragoSymbolRegistry.get(log.params.gabcoin.value).dragoID
                const name = dragoSymbolRegistry.get(log.params.gabcoin.value).name
                log.symbol = symbol

                var amount = () => {
                  switch (log.type) {
                    case 'BuyDrago':
                      return new BigNumber(log.params.revenue.value)
                      break;
                    case 'SellDrago':
                      return new BigNumber(-log.params.amount.value)
                      break;
                    case 'BuyGabcoin':
                      return new BigNumber(log.params.revenue.value)
                      break;
                    case 'SellGabcoin':
                      return new BigNumber(-log.params.amount.value)
                      break;
                    default:
                      return new BigNumber(0)
                  }
                }
                if (options.balance) {
                  if (typeof dragoBalances[dragoID] !== 'undefined') {
                    var balance = dragoBalances[dragoID].balance.add(amount())
                  } else {
                    var balance = amount()
                  }
                  dragoBalances[dragoID] = {
                    balance: balance,
                    name: name,
                    symbol,
                    dragoID,
                  }
                }
                return log
              }


              )
              // Filtering Drago with 0 balance
              dragoBalances = dragoBalances.filter((balance) => {
                return balance.balance != 0
              })
              return transLogs
            }

            const getTimestamp = (logs) => {
              return logs.map((log, index) => {
                return api.eth
                  .getBlockByNumber(log.blockNumber.c[0])
                  .then((block) => {
                    log.timestamp = block.timestamp
                    return log
                  })
                  .catch((error) => {
                    // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                    // other issues in the app.
                    log.timestamp = new Date()
                    return log
                  })
              })
            }


            return Promise.all(getDragoDetails())
              .then(() => {
                return Promise.all(getDragoSupply())
                  .then(() => {
                    var logs = setSymbolAndBalance()
                    return Promise.all(getTimestamp(logs))
                      .then((logs) => {
                        var balances = [];

                        // Reorganizing the balances array
                        for (var v in dragoBalances) {
                          var balance = {
                            symbol: dragoBalances[v].symbol,
                            name: dragoBalances[v].name,
                            dragoID: dragoBalances[v].dragoID,
                            balance: formatCoins(dragoBalances[v].balance, 4, api)
                          }
                          balances.push(balance)
                        }
                        var results = [balances, logs, supply]
                        console.log(results)
                        // console.log(`${sourceLogClass} -> Transactions list loaded`)
                        return results
                      })
                  })
              })
          })
          .then((results) => {
            return results
          })
      })
  }

  getTransactionsDragoOpt = (api, dragoAddress, accounts, options = { balance: true, supply: false, limit: 5, trader: true }) => {
    const sourceLogClass = this.constructor.name
    var resultsAll = null
    const dragoApi = new DragoApi(api)
    var ethvalue = 0
    var drgvalue = 0
    var dragoSymbolRegistry = new Map()
    // console.log(options)
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      // console.log(log)
      if (typeof params.amount !== 'undefined') {
        ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
        drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
      }
      // console.log(log.event)
      if (log.event === 'BuyDrago' || log.event === 'DragoCreated') {
        !dragoSymbolRegistry.has(params.drago.value) ? dragoSymbolRegistry.set(params.drago.value, { symbol: null, dragoID: null, name: null }) : null
      }
      // console.log(dragoSymbolRegistry)

      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params,
        key,
        ethvalue,
        drgvalue
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

    // const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
    var hexAccounts = null

    var balances = null
    // Formatting accounts address
    if (accounts !== null) {
      hexAccounts = accounts.map((account) => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
        return hexAccount
      })
    }

    // Initializing the eventful contract
    return dragoApi.contract.eventful.init()
      .then(() => {
        // Filter for create events
        const eventsFilterCreate = {
          topics: [
            [dragoApi.contract.eventful.hexSignature.DragoCreated],
            null,
            null,
            hexAccounts
          ]
        }
        // Filter for buy events
        const eventsFilterBuy = {
          topics: [
            [dragoApi.contract.eventful.hexSignature.BuyDrago],
            null,
            hexAccounts,
            null
          ]
        }
        // Filter for sell events
        const eventsFilterSell = {
          topics: [
            [dragoApi.contract.eventful.hexSignature.SellDrago],
            null,
            null,
            hexAccounts
          ]
        }

        const createDragoEvents = () => {
          return dragoApi.contract.eventful
            .getAllLogs(eventsFilterCreate)
            .then((dragoTransactionsLog) => {
              const createLogs = dragoTransactionsLog.map(logToEvent)
              return createLogs
            }
            )
        }

        const buyDragoEvents = () => {
          return dragoApi.contract.eventful
            .getAllLogs(eventsFilterBuy)
            .then((dragoTransactionsLog) => {
              const buyLogs = dragoTransactionsLog.map(logToEvent)
              return buyLogs
            }
            )
        }

        const sellDragoEvents = () => {
          return dragoApi.contract.eventful
            .getAllLogs(eventsFilterSell)
            .then((dragoTransactionsLog) => {
              const sellLogs = dragoTransactionsLog.map(logToEvent)
              return sellLogs
            }
            )
        }

        var promisesEvents = null
        if (options.trader) {
          promisesEvents = [buyDragoEvents(), sellDragoEvents()]
        } else {
          promisesEvents = [createDragoEvents()]
        }
        return Promise.all(promisesEvents)
          .then((results) => {
            // Creating an array of promises that will be executed to add timestamp and symbol to each entry
            // Doing so because for each entry we need to make an async call to the client
            // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
            // console.log(results)
            var dragoTransactionsLog = options.trader ? [...results[0], ...results[1]] : [...results[0]]
            var dragoBalances = []
            var supply = []

            // This is an inefficient way to get the symbol for each transactions. 
            // In the future the symbol will have to be saved in the eventful logs.
            const getDragoDetails = () => {
              var arrayPromises = []
              dragoSymbolRegistry.forEach((v, k) => {
                arrayPromises.push(
                  dragoApi.contract.dragoregistry.init()
                    .then(() => {
                      return dragoApi.contract.dragoregistry.fromAddress(k)
                        .then((dragoDetails) => {
                          dragoSymbolRegistry.set(k, { symbol: dragoDetails[2].trim(), dragoID: dragoDetails[3].toFixed(), name: dragoDetails[1].trim() })
                        }
                        )
                    }
                    )
                )
              }
              )
              return arrayPromises
            }

            // Getting dragos supply
            const getDragoSupply = () => {
              var arrayPromises = []
              if (options.supply === false) {
                supply = []
                return arrayPromises
              }
              dragoSymbolRegistry.forEach((v, k) => {
                dragoApi.contract.drago.init(k)
                arrayPromises.push(
                  dragoApi.contract.drago.totalSupply()
                    .then((dragoSupply) => {
                      const symbol = dragoSymbolRegistry.get(k).symbol
                      const name = dragoSymbolRegistry.get(k).name.trim()
                      const dragoID = dragoSymbolRegistry.get(k).dragoID
                      supply.push({
                        supply: formatCoins(new BigNumber(dragoSupply), 4, api),
                        name,
                        symbol: symbol,
                        dragoID: dragoID
                      })
                    }
                    )
                )
              }
              )
              return arrayPromises
            }

            // Setting symbol and calculating balance
            const setSymbolAndBalance = () => {
              var transLogs = dragoTransactionsLog.map((log) => {
                const symbol = dragoSymbolRegistry.get(log.params.drago.value).symbol
                const dragoID = dragoSymbolRegistry.get(log.params.drago.value).dragoID
                const name = dragoSymbolRegistry.get(log.params.drago.value).name
                log.symbol = symbol

                var amount = () => {
                  switch (log.type) {
                    case 'BuyDrago':
                      return new BigNumber(log.params.revenue.value)
                      break;
                    case 'SellDrago':
                      return new BigNumber(-log.params.amount.value)
                      break;
                    default:
                      return new BigNumber(0)
                  }
                }
                if (options.balance) {
                  if (typeof dragoBalances[dragoID] !== 'undefined') {
                    var balance = dragoBalances[dragoID].balance.add(amount())
                  } else {
                    var balance = amount()
                  }
                  dragoBalances[dragoID] = {
                    balance: balance,
                    name: name,
                    symbol,
                    dragoID,
                  }
                }
                return log
              }


              )
              // Filtering Drago with 0 balance
              dragoBalances = dragoBalances.filter((balance) => {
                return balance.balance != 0
              })
              return transLogs
            }

            const getTimestamp = (logs) => {
              return logs.map((log, index) => {
                return api.eth
                  .getBlockByNumber(log.blockNumber.c[0])
                  .then((block) => {
                    log.timestamp = block.timestamp
                    return log
                  })
                  .catch((error) => {
                    // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                    // other issues in the app.
                    log.timestamp = new Date()
                    return log
                  })
              })
            }


            return Promise.all(getDragoDetails())
              .then(() => {
                return Promise.all(getDragoSupply())
                  .then(() => {
                    var logs = setSymbolAndBalance()
                    return Promise.all(getTimestamp(logs))
                      .then((logs) => {
                        var balances = [];

                        // Reorganizing the balances array
                        for (var v in dragoBalances) {
                          var balance = {
                            symbol: dragoBalances[v].symbol,
                            name: dragoBalances[v].name,
                            dragoID: dragoBalances[v].dragoID,
                            balance: formatCoins(dragoBalances[v].balance, 4, api)
                          }
                          balances.push(balance)
                        }
                        var results = [balances, logs, supply]
                        // console.log(results)
                        // console.log(`${sourceLogClass} -> Transactions list loaded`)
                        return results
                      })
                  })
              })
          })
          .then((results) => {
            return results
          })
      })
  }


  getTransactionsVaultOptV2 = (api, dragoAddress, accounts, options = { balance: true, supply: false, limit: 20, trader: true }) => {
    const sourceLogClass = this.constructor.name
    var resultsAll = null
    const dragoApi = new DragoApi(api)
    var ethvalue = 0
    var drgvalue = 0
    var dragoSymbolRegistry = new Map()
    // console.log(options)
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      // Getting the transaction amounts if it's a buy or sell event
      if (typeof params.amount !== 'undefined') {
        ethvalue = (log.event === 'BuyGabcoin') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
        drgvalue = (log.event === 'SellGabcoin') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
      }
      // Creating a map with list of vaults
      if (log.event === 'BuyGabcoin' || log.event === 'GabcoinCreated') {
        !dragoSymbolRegistry.has(params.gabcoin.value) ? dragoSymbolRegistry.set(params.gabcoin.value, { symbol: null, dragoID: null, name: null }) : null
      }
      // console.log(dragoSymbolRegistry)

      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params,
        key,
        ethvalue,
        drgvalue
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

    // const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
    var hexAccounts = null

    var balances = null
    // Formatting accounts address
    if (accounts !== null) {
      hexAccounts = accounts.map((account) => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
        return hexAccount
      })
    }

    // Initializing the eventful contract
    return dragoApi.contract.dragoregistry.init()
      .then(() => {
        return dragoApi.contract.vaulteventful.init()
          .then(() => {
            // Filter for create events
            const eventsFilterCreate = {
              topics: [
                [dragoApi.contract.vaulteventful.hexSignature.GabcoinCreated],
                null,
                null,
                hexAccounts
              ]
            }
            // Filter for buy events
            const eventsFilterBuy = {
              topics: [
                [dragoApi.contract.vaulteventful.hexSignature.BuyGabcoin],
                null,
                hexAccounts,
                null
              ]
            }
            // Filter for sell events
            const eventsFilterSell = {
              topics: [
                [dragoApi.contract.vaulteventful.hexSignature.SellGabcoin],
                null,
                null,
                hexAccounts
              ]
            }

            const createDragoEvents = () => {
              return dragoApi.contract.vaulteventful
                .getAllLogs(eventsFilterCreate)
                .then((dragoTransactionsLog) => {
                  const createLogs = dragoTransactionsLog.map(logToEvent)
                  return createLogs
                }
                )
            }

            const buyDragoEvents = () => {
              return dragoApi.contract.vaulteventful
                .getAllLogs(eventsFilterBuy)
                .then((dragoTransactionsLog) => {
                  const buyLogs = dragoTransactionsLog.map(logToEvent)
                  return buyLogs
                }
                )
            }

            const sellDragoEvents = () => {
              return dragoApi.contract.vaulteventful
                .getAllLogs(eventsFilterSell)
                .then((dragoTransactionsLog) => {
                  const sellLogs = dragoTransactionsLog.map(logToEvent)
                  return sellLogs
                }
                )
            }

            var promisesEvents = null
            if (options.trader) {
              promisesEvents = [buyDragoEvents(), sellDragoEvents()]
            } else {
              promisesEvents = [createDragoEvents()]
            }
            return Promise.all(promisesEvents)
              .then((results) => {
                // Creating an array of promises that will be executed to add timestamp and symbol to each entry
                // Doing so because for each entry we need to make an async call to the client
                // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
                // console.log(results)

                function compare(a, b) {
                  // Use toUpperCase() to ignore character casing
                  const bloclNumberA = a.blockNumber
                  const bloclNumberB = b.blockNumber

                  let comparison = 0;
                  if (bloclNumberA.gt(bloclNumberB)) {
                    comparison = 1;
                  } else if (bloclNumberA.lt(bloclNumberB)) {
                    comparison = -1;
                  }
                  return comparison;
                }

                var allLogs = options.trader ? [...results[0], ...results[1]] : [...results[0]]
                var supply = []
                var balances = []
                allLogs.sort(compare);
                var dragoTransactionsLogs = allLogs.slice(allLogs.length - 20, allLogs.length)
                // console.log(allLogs)

                // This is an inefficient way to get the symbol for each transactions. 
                // In the future the symbol will have to be saved in the eventful logs.
                const getDragoDetails = () => {
                  var arrayPromises = []
                  dragoSymbolRegistry.forEach((v, k) => {
                    arrayPromises.push(
                      dragoApi.contract.dragoregistry.fromAddress(k)
                        .then((dragoDetails) => {
                          // console.log(dragoDetails)
                          dragoSymbolRegistry.set(k, { symbol: dragoDetails[2].trim(), dragoID: dragoDetails[3].toFixed(), name: dragoDetails[1].trim() })
                          return dragoDetails
                        }
                        )
                    )
                  }
                  )
                  // console.log(arrayPromises)
                  return arrayPromises



                  // dragoSymbolRegistry.forEach((v, k) => {
                  //   arrayPromises.push(
                  //     dragoApi.contract.dragoregistry.init()
                  //       .then(() => {
                  //         return dragoApi.contract.dragoregistry.fromAddress(k)
                  //           .then((dragoDetails) => {
                  //             dragoSymbolRegistry.set(k, { symbol: dragoDetails[2].trim(), dragoID: dragoDetails[3].toFixed(), name: dragoDetails[1].trim() })
                  //           }
                  //           )
                  //       }
                  //       )
                  //   )
                  // }
                  // )
                  // return arrayPromises
                }

                // Getting dragos supply
                const getDragoSupply = () => {
                  var arrayPromises = []
                  if (options.supply === false) {
                    supply = []
                    return arrayPromises
                  }
                  dragoSymbolRegistry.forEach((v, k) => {
                    dragoApi.contract.vault.init(k)
                    arrayPromises.push(
                      dragoApi.contract.vault.totalSupply()
                        .then((dragoSupply) => {
                          const symbol = dragoSymbolRegistry.get(k).symbol
                          const name = dragoSymbolRegistry.get(k).name.trim()
                          const dragoID = dragoSymbolRegistry.get(k).dragoID
                          supply.push({
                            supply: formatCoins(new BigNumber(dragoSupply), 4, api),
                            name,
                            symbol: symbol,
                            dragoID: dragoID
                          })
                        }
                        )
                    )
                  }
                  )
                  return arrayPromises
                }

                // Getting dragos balances
                const getDragoBalances = () => {
                  var arrayPromises = []
                  // Checking if balance return is required
                  if (options.balance === false) {
                    balances = []
                    return arrayPromises
                  }
                  hexAccounts.map(account => {
                    balances[account] = []
                    dragoSymbolRegistry.forEach((v, k) => {
                      dragoApi.contract.vault.init(k)
                      arrayPromises.push(
                        dragoApi.contract.vault.balanceOf(account)
                          .then((dragoBalance) => {
                            const symbol = dragoSymbolRegistry.get(k).symbol
                            const name = dragoSymbolRegistry.get(k).name.trim()
                            const dragoID = dragoSymbolRegistry.get(k).dragoID
                            balances[account][dragoID] = {
                              balance: dragoBalance,
                              name,
                              symbol: symbol,
                              dragoID: dragoID,
                            }
                          }
                          )
                      )
                    }
                    )
                  })
                  return arrayPromises
                }

                // Setting symbol
                const getSymbols = () => {
                  var transLogs = dragoTransactionsLogs.map((log) => {
                    const symbol = dragoSymbolRegistry.get(log.params.gabcoin.value).symbol
                    const dragoID = dragoSymbolRegistry.get(log.params.gabcoin.value).dragoID
                    const name = dragoSymbolRegistry.get(log.params.gabcoin.value).name
                    log.symbol = symbol
                    return log
                  })
                  return transLogs
                }

                const getTimestamp = (logs) => {
                  return logs.map((log, index) => {
                    return api.eth
                      .getBlockByNumber(log.blockNumber.c[0])
                      .then((block) => {
                        log.timestamp = block.timestamp
                        return log
                      })
                      .catch((error) => {
                        // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                        // other issues in the app.
                        console.warn(error)
                        log.timestamp = new Date()
                        return log
                      })
                  })
                }


                return Promise.all(getDragoDetails())
                  .then(() => {
                    return Promise.all(getDragoSupply())
                      .then(() => {
                        Promise.all(getDragoBalances())
                          .then(() => {
                            if (options.balance) {
                              // Reorganizing the balances array
                              var balancesRegistry = new Map()
                              var tokenBalances = []
                              for (var v in balances) {
                                balances[v].map(balance => {
                                  if (balancesRegistry.has(balance.dragoID)) {
                                    var dragoBalance = balancesRegistry.get(balance.dragoID).balance
                                    balancesRegistry.set(balance.dragoID, { symbol: balance.symbol, dragoID: balance.dragoID, name: balance.name, balance: dragoBalance.add(balance.balance) })
                                  } else {
                                    balancesRegistry.set(balance.dragoID, { symbol: balance.symbol, dragoID: balance.dragoID, name: balance.name, balance: balance.balance })
                                  }
                                })
                              }
                              balancesRegistry.forEach((v, k) => {
                                tokenBalances.push(
                                  {
                                    symbol: balancesRegistry.get(k).symbol,
                                    name: balancesRegistry.get(k).name,
                                    dragoID: balancesRegistry.get(k).dragoID,
                                    balance: formatCoins(balancesRegistry.get(k).balance, 4, api)
                                  }
                                )
                              }
                              )
                              // Filtering empty balances
                              balances = tokenBalances.filter((balance) => {
                                return balance.balance != 0
                              })
                            }
                          })

                        var logs = getSymbols()
                        return Promise.all(getTimestamp(logs))
                          .then((logs) => {
                            var results = [balances, logs, supply]
                            return results
                          })
                      })
                  })
              })
              .then((results) => {
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
  getTransactionsDragoOptV2 = (api, dragoAddress, accounts, options = { balance: true, supply: false, limit: 20, trader: true }) => {
    const sourceLogClass = this.constructor.name
    var resultsAll = null
    const dragoApi = new DragoApi(api)
    var ethvalue = 0
    var drgvalue = 0
    var dragoSymbolRegistry = new Map()
    // console.log(options)
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      // Getting the transaction amounts if it's a buy or sell event
      if (typeof params.amount !== 'undefined') {
        ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
        drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
      }
      // Creating a map with list of dragos
      if (log.event === 'BuyDrago' || log.event === 'DragoCreated') {
        !dragoSymbolRegistry.has(params.drago.value) ? dragoSymbolRegistry.set(params.drago.value, { symbol: null, dragoID: null, name: null }) : null
      }
      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params,
        key,
        ethvalue,
        drgvalue
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

    // const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
    var hexAccounts = null

    var balances = null
    // Formatting accounts address
    if (accounts !== null) {
      hexAccounts = accounts.map((account) => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
        return hexAccount
      })
    }

    // Initializing the eventful contract
    return dragoApi.contract.dragoregistry.init()
      .then(() => {
        return dragoApi.contract.eventful.init()
          .then(() => {
            // Filter for create events
            const eventsFilterCreate = {
              topics: [
                [dragoApi.contract.eventful.hexSignature.DragoCreated],
                null,
                null,
                hexAccounts
              ]
            }
            // Filter for buy events
            const eventsFilterBuy = {
              topics: [
                [dragoApi.contract.eventful.hexSignature.BuyDrago],
                null,
                hexAccounts,
                null
              ]
            }
            // Filter for sell events
            const eventsFilterSell = {
              topics: [
                [dragoApi.contract.eventful.hexSignature.SellDrago],
                null,
                null,
                hexAccounts
              ]
            }

            const createDragoEvents = () => {
              return dragoApi.contract.eventful
                .getAllLogs(eventsFilterCreate)
                .then((dragoTransactionsLog) => {
                  const createLogs = dragoTransactionsLog.map(logToEvent)
                  return createLogs
                }
                )
            }

            const buyDragoEvents = () => {
              return dragoApi.contract.eventful
                .getAllLogs(eventsFilterBuy)
                .then((dragoTransactionsLog) => {
                  const buyLogs = dragoTransactionsLog.map(logToEvent)
                  return buyLogs
                }
                )
            }

            const sellDragoEvents = () => {
              return dragoApi.contract.eventful
                .getAllLogs(eventsFilterSell)
                .then((dragoTransactionsLog) => {
                  const sellLogs = dragoTransactionsLog.map(logToEvent)
                  return sellLogs
                }
                )
            }

            var promisesEvents = null
            if (options.trader) {
              promisesEvents = [buyDragoEvents(), sellDragoEvents()]
            } else {
              promisesEvents = [createDragoEvents()]
            }
            return Promise.all(promisesEvents)
              .then((results) => {
                // Creating an array of promises that will be executed to add timestamp and symbol to each entry
                // Doing so because for each entry we need to make an async call to the client
                // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
                // console.log(results)

                function compare(a, b) {
                  // Use toUpperCase() to ignore character casing
                  const bloclNumberA = a.blockNumber
                  const bloclNumberB = b.blockNumber

                  let comparison = 0;
                  if (bloclNumberA.gt(bloclNumberB)) {
                    comparison = 1;
                  } else if (bloclNumberA.lt(bloclNumberB)) {
                    comparison = -1;
                  }
                  return comparison;
                }

                var allLogs = options.trader ? [...results[0], ...results[1]] : [...results[0]]
                var supply = []
                var balances = []
                allLogs.sort(compare);
                var dragoTransactionsLogs = allLogs.slice(allLogs.length - 20, allLogs.length)
                // console.log(allLogs)

                // This is an inefficient way to get the symbol for each transactions. 
                // In the future the symbol will have to be saved in the eventful logs.
                const getDragoDetails = () => {
                  var arrayPromises = []
                  dragoSymbolRegistry.forEach((v, k) => {
                    arrayPromises.push(
                      dragoApi.contract.dragoregistry.fromAddress(k)
                        .then((dragoDetails) => {
                          // console.log(dragoDetails)
                          dragoSymbolRegistry.set(k, { symbol: dragoDetails[2].trim(), dragoID: dragoDetails[3].toFixed(), name: dragoDetails[1].trim() })
                          return dragoDetails
                        }
                        )
                    )
                  }
                  )
                  // console.log(arrayPromises)
                  return arrayPromises



                  // dragoSymbolRegistry.forEach((v, k) => {
                  //   arrayPromises.push(
                  //     dragoApi.contract.dragoregistry.init()
                  //       .then(() => {
                  //         return dragoApi.contract.dragoregistry.fromAddress(k)
                  //           .then((dragoDetails) => {
                  //             dragoSymbolRegistry.set(k, { symbol: dragoDetails[2].trim(), dragoID: dragoDetails[3].toFixed(), name: dragoDetails[1].trim() })
                  //           }
                  //           )
                  //       }
                  //       )
                  //   )
                  // }
                  // )
                  // return arrayPromises
                }

                // Getting dragos supply
                const getDragoSupply = () => {
                  var arrayPromises = []
                  if (options.supply === false) {
                    supply = []
                    return arrayPromises
                  }
                  dragoSymbolRegistry.forEach((v, k) => {
                    dragoApi.contract.drago.init(k)
                    arrayPromises.push(
                      dragoApi.contract.drago.totalSupply()
                        .then((dragoSupply) => {
                          const symbol = dragoSymbolRegistry.get(k).symbol
                          const name = dragoSymbolRegistry.get(k).name.trim()
                          const dragoID = dragoSymbolRegistry.get(k).dragoID
                          supply.push({
                            supply: formatCoins(new BigNumber(dragoSupply), 4, api),
                            name,
                            symbol: symbol,
                            dragoID: dragoID
                          })
                        }
                        )
                    )
                  }
                  )
                  return arrayPromises
                }

                // Getting dragos balances
                const getDragoBalances = () => {
                  var arrayPromises = []
                  // Checking if balance return is required
                  if (options.balance === false) {
                    balances = []
                    return arrayPromises
                  }
                  hexAccounts.map(account => {
                    balances[account] = []
                    dragoSymbolRegistry.forEach((v, k) => {
                      dragoApi.contract.drago.init(k)
                      arrayPromises.push(
                        dragoApi.contract.drago.balanceOf(account)
                          .then((dragoBalance) => {
                            const symbol = dragoSymbolRegistry.get(k).symbol
                            const name = dragoSymbolRegistry.get(k).name.trim()
                            const dragoID = dragoSymbolRegistry.get(k).dragoID
                            balances[account][dragoID] = {
                              balance: dragoBalance,
                              name,
                              symbol: symbol,
                              dragoID: dragoID,
                            }
                          }
                          )
                      )
                    }
                    )
                  })
                  return arrayPromises
                }

                // Setting symbol
                const getSymbols = () => {
                  var transLogs = dragoTransactionsLogs.map((log) => {
                    const symbol = dragoSymbolRegistry.get(log.params.drago.value).symbol
                    const dragoID = dragoSymbolRegistry.get(log.params.drago.value).dragoID
                    const name = dragoSymbolRegistry.get(log.params.drago.value).name
                    log.symbol = symbol
                    return log
                  })
                  return transLogs
                }

                const getTimestamp = (logs) => {
                  return logs.map((log, index) => {
                    return api.eth
                      .getBlockByNumber(log.blockNumber.c[0])
                      .then((block) => {
                        log.timestamp = block.timestamp
                        return log
                      })
                      .catch((error) => {
                        // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                        // other issues in the app.
                        log.timestamp = new Date()
                        return log
                      })
                  })
                }


                return Promise.all(getDragoDetails())
                  .then(() => {
                    return Promise.all(getDragoSupply())
                      .then(() => {
                        Promise.all(getDragoBalances())
                          .then(() => {
                            if (options.balance) {
                              // Reorganizing the balances array
                              var balancesRegistry = new Map()
                              var tokenBalances = []
                              for (var v in balances) {
                                balances[v].map(balance => {
                                  if (balancesRegistry.has(balance.dragoID)) {
                                    var dragoBalance = balancesRegistry.get(balance.dragoID).balance
                                    balancesRegistry.set(balance.dragoID, { symbol: balance.symbol, dragoID: balance.dragoID, name: balance.name, balance: dragoBalance.add(balance.balance) })
                                  } else {
                                    balancesRegistry.set(balance.dragoID, { symbol: balance.symbol, dragoID: balance.dragoID, name: balance.name, balance: balance.balance })
                                  }
                                })
                              }
                              balancesRegistry.forEach((v, k) => {
                                tokenBalances.push(
                                  {
                                    symbol: balancesRegistry.get(k).symbol,
                                    name: balancesRegistry.get(k).name,
                                    dragoID: balancesRegistry.get(k).dragoID,
                                    balance: formatCoins(balancesRegistry.get(k).balance, 4, api)
                                  }
                                )
                              }
                              )
                              // Filtering empty balances
                              balances = tokenBalances.filter((balance) => {
                                return balance.balance != 0
                              })
                            }
                          })

                        var logs = getSymbols()
                        return Promise.all(getTimestamp(logs))
                          .then((logs) => {
                            var results = [balances, logs, supply]
                            return results
                          })
                      })
                  })
              })
              .then((results) => {
                return results
              })
          })
      })

  }


  // getTransactionsDrago = (api, dragoAddress, accounts, options = { balance: true, supply: false, limit: 20 }) => {
  //   const sourceLogClass = this.constructor.name
  //   var resultsAll = null
  //   const dragoApi = new DragoApi(api)
  //   var ethvalue = 0
  //   var drgvalue = 0
  //   const logToEvent = (log) => {
  //     const key = api.util.sha3(JSON.stringify(log))
  //     const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
  //     if (typeof params.amount !== 'undefined') {
  //       ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
  //       drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
  //     }
  //     return {
  //       type: log.event,
  //       state: type,
  //       blockNumber,
  //       logIndex,
  //       transactionHash,
  //       transactionIndex,
  //       params,
  //       key,
  //       ethvalue,
  //       drgvalue
  //     }
  //   }

  //   // Getting all buyDrago and selDrago events since block 0.
  //   // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
  //   // to be passed to getAllLogs. Events are indexed and filtered by topics
  //   // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

  //   // The second param of the topics array is the drago address
  //   // The third param of the topics array is the from address
  //   // The third param of the topics array is the to address
  //   //
  //   //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

  //   // const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
  //   var hexAccounts = null

  //   var balances = null
  //   // Formatting accounts address
  //   if (accounts !== null) {
  //     hexAccounts = accounts.map((account) => {
  //       const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
  //       return hexAccount
  //     })
  //   }

  //   // Initializing the eventful contract
  //   return dragoApi.contract.eventful.init()
  //     .then(() => {
  //       // Filter for create events
  //       const eventsFilterCreate = {
  //         topics: [
  //           [dragoApi.contract.eventful.hexSignature.DragoCreated],
  //           null,
  //           null,
  //           hexAccounts
  //         ]
  //       }
  //       // Filter for buy events
  //       const eventsFilterBuy = {
  //         topics: [
  //           [dragoApi.contract.eventful.hexSignature.BuyDrago],
  //           null,
  //           hexAccounts,
  //           null
  //         ]
  //       }
  //       // Filter for sell events
  //       const eventsFilterSell = {
  //         topics: [
  //           [dragoApi.contract.eventful.hexSignature.SellDrago],
  //           null,
  //           null,
  //           hexAccounts
  //         ]
  //       }
  //       const createDragoEvents = dragoApi.contract.eventful
  //         .getAllLogs(eventsFilterCreate)
  //         .then((dragoTransactionsLog) => {
  //           const buyLogs = dragoTransactionsLog.map(logToEvent)
  //           return buyLogs
  //         }
  //         )
  //       const buyDragoEvents = dragoApi.contract.eventful
  //         .getAllLogs(eventsFilterBuy)
  //         .then((dragoTransactionsLog) => {
  //           const buyLogs = dragoTransactionsLog.map(logToEvent)
  //           return buyLogs
  //         }
  //         )
  //       const sellDragoEvents = dragoApi.contract.eventful
  //         .getAllLogs(eventsFilterSell)
  //         .then((dragoTransactionsLog) => {
  //           const sellLogs = dragoTransactionsLog.map(logToEvent)
  //           return sellLogs
  //         }
  //         )
  //       return Promise.all([buyDragoEvents, sellDragoEvents, createDragoEvents])
  //         .then((results) => {
  //           // Creating an array of promises that will be executed to add timestamp and symbol to each entry
  //           // Doing so because for each entry we need to make an async call to the client
  //           // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
  //           var dragoTransactionsLog = [...results[0], ...results[1], ...results[2]]
  //           dragoTransactionsLog.filter(function (val) { return val !== null; })
  //           var dragoBalances = []
  //           var supply = []

  //           const promisesTimestamp = dragoTransactionsLog.map((log, index) => {
  //             return api.eth
  //               .getBlockByNumber(log.blockNumber.c[0])
  //               .then((block) => {
  //                 log.timestamp = block.timestamp
  //                 return log
  //               })
  //               .catch((error) => {
  //                 // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
  //                 // other issues in the app.
  //                 log.timestamp = new Date()
  //                 return log
  //               })
  //           })

  //           // This is an inefficient way to get the symbol for each transactions. 
  //           // In the future the symbol will have to be saved in the eventful logs.
  //           const promisesSymbol = dragoTransactionsLog.map((log) => {
  //             return dragoApi.contract.dragoregistry.init()
  //               .then(() => {
  //                 return dragoApi.contract.dragoregistry.fromAddress(log.params.drago.value)
  //                   .then((dragoDetails) => {
  //                     const symbol = dragoDetails[2]
  //                     const dragoID = dragoDetails[3].c[0]
  //                     const name = dragoDetails[1]
  //                     var amount = () => {
  //                       switch (log.type) {
  //                         case 'BuyDrago':
  //                           return new BigNumber(log.params.revenue.value)
  //                           break;
  //                         case 'SellDrago':
  //                           return new BigNumber(-log.params.amount.value)
  //                           break;
  //                         default:
  //                           return new BigNumber(0)
  //                       }
  //                     }

  //                     if (options.balance) {
  //                       if (typeof dragoBalances[dragoID] !== 'undefined') {
  //                         var balance = dragoBalances[dragoID].balance.add(amount())
  //                       } else {
  //                         var balance = amount()
  //                       }
  //                       dragoBalances[dragoID] = {
  //                         balance: balance,
  //                         name,
  //                         symbol,
  //                         dragoID,
  //                       }
  //                     }
  //                     log.symbol = symbol
  //                     return log
  //                   })
  //                   .then((log) => {
  //                     if (log.type === 'DragoCreated' && options.supply) {
  //                       // return Promise.all([
  //                       //   this.getDragoSupply(log.params.drago.value, api),
  //                       // ])
  //                       dragoApi.contract.drago.init(log.params.drago.value)
  //                       return dragoApi.contract.drago.totalSupply()
  //                         .then((dragoSupply) => {
  //                           // console.log(`${sourceLogClass} ->  dragoDetails Symbol: ${dragoDetails[0][2]}`)
  //                           const symbol = log.params.symbol.value
  //                           const name = log.params.name.value
  //                           const dragoID = log.params.dragoID.value.c[0]
  //                           supply.push({
  //                             supply: formatCoins(new BigNumber(dragoSupply), 4, api),
  //                             name: name,
  //                             symbol: symbol,
  //                             dragoID: dragoID
  //                           })
  //                           log.symbol = symbol
  //                           return log
  //                         })
  //                     }
  //                     return log
  //                   })
  //               })
  //           })

  //           // Running all promises
  //           return Promise.all(promisesTimestamp)
  //             .then((results) => {
  //               return Promise.all(promisesSymbol)
  //                 .then((results) => {
  //                   var balances = [];
  //                   console.log(`${sourceLogClass} -> Transactions list loaded`);
  //                   // Reorganizing the balances array
  //                   for (var v in dragoBalances) {
  //                     var balance = {
  //                       symbol: dragoBalances[v].symbol,
  //                       name: dragoBalances[v].name,
  //                       dragoID: dragoBalances[v].dragoID,
  //                       balance: formatCoins(dragoBalances[v].balance, 4, api)
  //                     }
  //                     balances.push(balance)
  //                   }
  //                   results = [balances, results, supply]
  //                   return results
  //                 })
  //             })
  //         })
  //         .then((results) => {
  //           return results
  //         })
  //     })
  // }


  shallowEqual(objA: mixed, objB: mixed): boolean {
    const sourceLogClass = this.constructor.name
    if (objA === objB) {
      // console.log(`${sourceLogClass} -> objA === objB`)
      return true;
    }

    if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
      // console.log(`${sourceLogClass} -> objA !== 'object'`)
      return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      // console.log(`${sourceLogClass} -> keysA.length`);
      return false;
    }

    // Test for A's keys different from B.
    var bHasOwnProperty = hasOwnProperty.bind(objB);
    for (var i = 0; i < keysA.length; i++) {
      if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        // console.log(`${sourceLogClass} -> Test for A's keys different from B`)
        return false;
      }
    }
    return true;
  }

  pathExplode(path) {
    var explodedPath = path.pathname.split('/');
    return explodedPath
  }

  rootPath(location) {
    var path = location.split('/');
    // path.splice(-1,1);
    // var url = path.join('/');
    return DS + APP + DS + path[2]
  }

  pathLast(path) {
    return path.pathname.split('/').pop();
  }

  dragoISIN(symbol, dragoID) {
    return DRG_ISIN + dragoID.toString().padStart(7, "0") + symbol;
  }
}

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }));
// }
var utils = new utilities();
export default utils;