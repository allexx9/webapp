import { blockChunks } from './blockChunks'
import { formatCoins, formatEth } from './../format'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3Wrapper from '../../_utils/web3Wrapper/src'

export const getTransactionsSingleDrago = async (
  dragoAddress,
  api,
  accounts,
  options = {
    limit: 20
  }
) => {
  let web3 = await Web3Wrapper.getInstance(api._rb.network.id)
  web3._rb = window.web3._rb
  const poolApi = new PoolApi(web3)
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
      fromBlock = '3000000'
  }

  const logToEvent = log => {
    const key = web3.utils.sha3(JSON.stringify(log))
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
          ? formatEth(returnValues.amount, null)
          : formatEth(returnValues.revenue, null)
      drgvalue =
        event === 'SellDrago'
          ? formatCoins(returnValues.amount, null)
          : formatCoins(returnValues.revenue, null)
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
    return web3.eth.getBlockNumber().then(lastBlock => {
      let chunck = 100000
      const chunks = blockChunks(fromBlock, lastBlock, chunck)
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
      let dragoTransactionsLogs = logs[0].slice(
        logs[0].length - options.limit,
        logs[0].length
      )
      return dragoTransactionsLogs
    })
    .then(dragoTransactionsLog => {
      // Creating an array of promises that will be executed to add timestamp to each entry
      // Doing so because for each entry we need to make an async call to the client
      // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
      let logPromises = dragoTransactionsLog.map(async log => {
        return await web3.eth
          .getBlock(new BigNumber(log.blockNumber).toFixed(0))
          .then(block => {
            log.timestamp = new Date(block.timestamp * 1000)
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
      return Promise.all(logPromises).then(results => {
        results.sort(function(x, y) {
          return y.timestamp - x.timestamp
        })
        console.log(
          `${
            this.constructor.name
          } -> getTransactionsSingleDrago: Transactions list loaded`
        )
        return results
      })
    })
}
