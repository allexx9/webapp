import { blockChunks } from './blockChunks'
import { dateFromTimeStampHuman } from './dateFromTimeStampHuman'
import { formatCoins, formatEth } from './../format'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3Wrapper from '../web3Wrapper/src'

export const getDragoDetails = async (
  dragoDetails,
  accounts,
  api,
  options = { date: true }
) => {
  //
  // Initializing Drago API
  //
  console.time('getDragoDetails')
  let newWeb3 = Web3Wrapper.getInstance(api._rb.network.id)
  newWeb3._rb = window.web3._rb
  const poolApiWeb3 = new PoolApi(newWeb3)
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
      fromBlock = '3000000'
  }
  //
  // Getting last transactions
  //
  // await poolApiWeb3.contract.dragoeventful.init()

  //
  // Initializing drago contract
  //
  // await poolApiWeb3.contract.drago.init(dragoAddress)
  // await poolApiWeb3.contract.drago.init(dragoAddress)

  await Promise.all([
    poolApiWeb3.contract.dragoeventful.init(),
    poolApiWeb3.contract.drago.init(dragoAddress)
  ]).catch(e => new Error(e))

  //
  // Gettind drago data, creation date, supply, ETH balances
  //

  const getDragoCreationDate = async address => {
    const hexPoolAddress = '0x' + address.substr(2).padStart(64, '0')

    let topics = [
      [poolApiWeb3.contract.dragoeventful.hexSignature.DragoCreated],
      [hexPoolAddress],
      null,
      null
    ]

    let arrayPromises = []
    return api.eth.getBlockNumber().then(lastBlock => {
      let chunck = 100000
      lastBlock = new BigNumber().toFixed()
      const chunks = blockChunks(fromBlock, lastBlock, chunck)
      arrayPromises = chunks.map(async chunk => {
        // Pushing chunk logs into array
        let options = {
          topics: topics,
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock
        }
        return await poolApiWeb3.contract.dragoeventful.getAllLogs(options)
      })

      return Promise.all(arrayPromises)
        .then(results => {
          let logs = [].concat(...results)
          if (logs.length !== 0) {
            return api.eth
              .getBlockByNumber(logs[0].blockNumber.toFixed(0))
              .then(result => {
                return dateFromTimeStampHuman(result.timestamp)
              })
          } else {
            return dateFromTimeStampHuman(new Date(0))
          }
        })
        .catch(error => {
          console.warn(error)
          throw Error(error)
        })
    })
  }
  let dragoCreatedDate = getDragoCreationDate(dragoAddress)

  let balanceDRG = new BigNumber(0)
  let dragoData = poolApiWeb3.contract.drago.getData()
  // .catch(e => new Error(e))
  let dragoTotalSupply = poolApiWeb3.contract.drago.totalSupply()
  let dragoETH = poolApiWeb3.contract.drago.getBalance()
  let dragoWETH = poolApiWeb3.contract.drago.getBalanceWETH()

  //
  // Getting balance for each user account
  //
  if (accounts.length > 1) {
    balanceDRG = Promise.all(
      accounts.map(async account => {
        const balance = await poolApiWeb3.contract.drago
          .balanceOf(account.address)
          .catch(e => new Error(e))
        balanceDRG = balanceDRG.plus(balance)
      })
    )
  } else {
    balanceDRG = poolApiWeb3.contract.drago.balanceOf(accounts[0].address)
  }

  // .catch(e => new Error(e))
  ;[
    dragoData,
    dragoTotalSupply,
    dragoETH,
    dragoWETH,
    balanceDRG,
    dragoCreatedDate
  ] = await Promise.all([
    dragoData,
    dragoTotalSupply,
    dragoETH,
    dragoWETH,
    balanceDRG,
    dragoCreatedDate
  ]).catch(e => new Error(e))
  console.log(dragoData, dragoTotalSupply, dragoETH, dragoWETH, balanceDRG)
  const dragoETHBalance = await formatEth(dragoETH, 4)
  const dragoWETHBalance = await formatEth(dragoWETH, 4)

  let details = {
    address: dragoDetails[0][0],
    name:
      dragoDetails[0][1].charAt(0).toUpperCase() + dragoDetails[0][1].slice(1),
    symbol: dragoDetails[0][2],
    dragoId: new BigNumber(dragoDetails[0][3]).toFixed(),
    addressOwner: dragoDetails[0][4],
    addressGroup: dragoDetails[0][5],
    sellPrice: api.util
      .fromWei(new BigNumber(dragoData[2]).toNumber(4))
      .toFormat(4),
    buyPrice: api.util
      .fromWei(new BigNumber(dragoData[3]).toNumber(4))
      .toFormat(4),
    created: dragoCreatedDate,
    totalSupply: formatCoins(new BigNumber(dragoTotalSupply), 4, api),
    dragoETHBalance,
    dragoWETHBalance
  }

  // console.log(details)

  balanceDRG = formatCoins(balanceDRG, 4, api)
  details = { ...details, balanceDRG }
  console.log(details)
  console.timeEnd('getDragoDetails')
  return details
}
