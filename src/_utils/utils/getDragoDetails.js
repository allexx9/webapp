import { dateFromTimeStampHuman } from './dateFromTimeStampHuman'
import { formatCoins, formatEth } from './../format'
import { getBlockChunks } from './blockChunks'
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

  await Promise.all([
    poolApiWeb3.contract.dragoeventful.init(),
    poolApiWeb3.contract.drago.init(dragoAddress)
  ]).catch(e => new Error(e))

  //
  // Getting drago data, creation date, supply, ETH balances
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
    return newWeb3.eth.getBlockNumber().then(async lastBlock => {
      let chunck = 100000
      lastBlock = new BigNumber(lastBlock).toNumber()
      const chunks = await getBlockChunks(fromBlock, lastBlock, chunck, newWeb3)
      arrayPromises = chunks.map(async chunk => {
        // Pushing chunk logs into array
        let options = {
          topics: topics,
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock
        }
        return poolApiWeb3.contract.dragoeventful.getAllLogs(options)
      })

      return Promise.all(arrayPromises)
        .then(results => {
          let logs = [].concat(...results)
          if (logs.length !== 0) {
            return newWeb3.eth
              .getBlock(logs[0].blockNumber.toFixed(0))
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

  ;[
    dragoData,
    dragoTotalSupply,
    dragoETH,
    dragoWETH,
    balanceDRG
    // dragoCreatedDate
  ] = await Promise.all([
    dragoData,
    dragoTotalSupply,
    dragoETH,
    dragoWETH,
    balanceDRG
    // dragoCreatedDate
  ]).catch(e => new Error(e))
  console.log(
    dragoData,
    dragoTotalSupply,
    dragoETH,
    dragoWETH,
    balanceDRG
    // dragoCreatedDate
  )

  dragoCreatedDate = 0

  let details = {
    address: dragoDetails[0][0],
    name:
      dragoDetails[0][1].charAt(0).toUpperCase() + dragoDetails[0][1].slice(1),
    symbol: dragoDetails[0][2],
    dragoId: new BigNumber(dragoDetails[0][3]).toFixed(),
    addressOwner: dragoDetails[0][4],
    addressGroup: dragoDetails[0][5],
    sellPrice: new BigNumber(api.utils.fromWei(dragoData[2])).toFormat(4),
    buyPrice: new BigNumber(api.utils.fromWei(dragoData[3])).toFormat(4),
    created: dragoCreatedDate,
    totalSupply: formatCoins(new BigNumber(dragoTotalSupply), 4),
    dragoETHBalance: formatEth(dragoETH, 4),
    dragoWETHBalance: formatEth(dragoWETH, 4),
    balanceDRG: formatCoins(balanceDRG, 4)
  }
  console.timeEnd('getDragoDetails')
  return details
}
