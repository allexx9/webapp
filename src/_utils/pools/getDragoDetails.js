import { dateFromTimeStampHuman } from '../misc/dateFromTimeStampHuman'
import { formatCoins, formatEth } from './../format'
import { getBlockChunks } from '../blockChain/getBlockChunks'
import { getFromBlock, getWeb3 } from '../misc'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'

export const getDragoDetails = async (
  dragoDetails,
  accounts,
  networkInfo,
  options = { dateOnly: false, wallet: '' }
) => {
  //
  // Initializing Drago API
  //

  let web3 = getWeb3(networkInfo, options)
  let fromBlock = getFromBlock(networkInfo)

  const poolApi = new PoolApi(web3)

  const dragoAddress = dragoDetails[0][0]

  await Promise.all([
    poolApi.contract.dragoeventful.init(),
    poolApi.contract.drago.init(dragoAddress)
  ]).catch(e => new Error(e))

  //
  // Getting drago data, creation date, supply, ETH balances
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
    return web3.eth.getBlockNumber().then(async lastBlock => {
      let chunck = 250000
      lastBlock = new BigNumber(lastBlock).toNumber()
      const chunks = await getBlockChunks(fromBlock, lastBlock, chunck, web3)

      arrayPromises = chunks.map(async chunk => {
        let options = {
          topics: topics,
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock
        }
        return poolApi.contract.dragoeventful
          .getAllLogs(options)
          .then(logs => {
            return logs
          })
          .catch(error => {
            console.warn(error)
            throw Error(error)
          })
      })

      return Promise.all(arrayPromises)
        .then(results => {
          if (results.length > 0) {
            let logs = [].concat(...results)
            if (logs.length !== 0) {
              return web3.eth
                .getBlock(logs[0].blockNumber.toFixed(0))
                .then(result => {
                  let date
                  try {
                    date = dateFromTimeStampHuman(result.timestamp)
                  } catch (error) {
                    date = '-'
                  }
                  return date
                })
                .catch(error => {
                  console.warn(error)
                  throw new Error(error)
                })
            } else {
              return '-'
            }
          } else {
            return '-'
          }
        })
        .catch(error => {
          console.warn(error)
          throw Error(error)
        })
    })
  }

  if (options.dateOnly) {
    let dragoCreatedDate = await getDragoCreationDate(dragoAddress)
    let details = {
      address: dragoAddress,
      created: dragoCreatedDate
    }
    return details
  }

  let balanceDRG = new BigNumber(0)
  let dragoData = poolApi.contract.drago.getData()
  let dragoTotalSupply = poolApi.contract.drago.totalSupply()
  let dragoETH = poolApi.contract.drago.getBalance()
  let dragoWETH = poolApi.contract.drago.getBalanceWETH()

  //
  // Getting balance for each user account
  //

  if (accounts.length > 1) {
    await Promise.all(
      accounts.map(async account => {
        const balance = await poolApi.contract.drago
          .balanceOf(account.address)
          .catch(e => new Error(e))
        balanceDRG = balanceDRG.plus(balance)
      })
    )
  } else {
    balanceDRG = poolApi.contract.drago.balanceOf(accounts[0].address)
  }

  try {
    dragoData = await dragoData
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    dragoTotalSupply = await dragoTotalSupply
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    dragoETH = await dragoETH
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    dragoWETH = await dragoWETH
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    balanceDRG = await balanceDRG
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  let sellPrice = formatEth(dragoData[2], 4)
  let buyPrice = formatEth(dragoData[3], 4)

  let details = {
    address: dragoDetails[0][0],
    name:
      dragoDetails[0][1].charAt(0).toUpperCase() + dragoDetails[0][1].slice(1),
    symbol: dragoDetails[0][2],
    dragoId: new BigNumber(dragoDetails[0][3]).toFixed(),
    addressOwner: dragoDetails[0][4],
    addressGroup: dragoDetails[0][5],
    sellPrice,
    buyPrice,
    totalSupply: formatCoins(new BigNumber(dragoTotalSupply), 4),
    totalSupplyBaseUnits: BigNumber(dragoTotalSupply),
    dragoETHBalance: formatEth(dragoETH, 4),
    dragoETHBalanceWei: new BigNumber(dragoETH),
    dragoWETHBalance: formatEth(dragoWETH, 4),
    balanceDRG: formatCoins(balanceDRG, 4)
  }

  return details
}
