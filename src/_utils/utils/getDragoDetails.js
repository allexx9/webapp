import { blockChunks } from './blockChunks'
import { dateFromTimeStampHuman } from './dateFromTimeStampHuman'
import { formatCoins, formatEth } from './../format'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3 from 'web3'
import Web3Wrapper from '../web3Wrapper/src'

export const getDragoDetails = async (dragoDetails, accounts, api) => {
  //
  // Initializing Drago API
  //

  let newWeb3 = await Web3Wrapper.getInstance(api._rb.network.id)
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
      '3000000'
  }
  //
  // Getting last transactions
  //
  await poolApiWeb3.contract.dragoeventful.init()

  //
  // Initializing drago contract
  //
  // await poolApiWeb3.contract.drago.init(dragoAddress)
  await poolApiWeb3.contract.drago.init(dragoAddress)

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
    return api.eth.blockNumber().then(lastBlock => {
      let chunck = 100000
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

  const dragoData = await poolApiWeb3.contract.drago.getData()
  const dragoCreatedDate = await getDragoCreationDate(dragoAddress)
  const dragoTotalSupply = await poolApiWeb3.contract.drago.totalSupply()
  const dragoETHBalance = await formatEth(
    await poolApiWeb3.contract.drago.getBalance(),
    5,
    api
  )
  const dragoWETHBalance = await formatEth(
    await poolApiWeb3.contract.drago.getBalanceWETH(),
    5,
    api
  )
  // console.log(dragoETHBalance, dragoTotalSupply)
  let details = {
    address: dragoDetails[0][0],
    name:
      dragoDetails[0][1].charAt(0).toUpperCase() + dragoDetails[0][1].slice(1),
    symbol: dragoDetails[0][2],
    dragoId: dragoDetails[0][3].toFixed(),
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

  //
  // Getting balance for each user account
  //
  let balanceDRG = new BigNumber(0)
  await Promise.all(
    accounts.map(async account => {
      const balance = await poolApiWeb3.contract.drago.balanceOf(
        account.address
      )
      balanceDRG = balanceDRG.plus(balance)
    })
  )
  console.log(`balanceDRG ${balanceDRG}`)
  balanceDRG = formatCoins(balanceDRG, 4, api)
  details = { ...details, balanceDRG }
  // console.log(details)
  return details
}
