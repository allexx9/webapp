import { dateFromTimeStampHuman } from './dateFromTimeStampHuman'
// import { ethers } from 'ethers'
import { HTTP_EVENT_FETCHING, METAMASK } from '../const'
import { formatCoins, formatEth } from './../format'
import { getBlockChunks } from './blockChunks'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3 from 'web3'
import Web3Wrapper from '../web3Wrapper/src'

export const getVaultDetails = async (
  vaultDetails,
  accounts,
  networkInfo,
  options = { dateOnly: false, wallet: '' }
) => {
  //
  // Initializing Vault API
  //
  let web3
  switch (options.wallet) {
    case METAMASK: {
      web3 = window.web3
    }
    default: {
      if (HTTP_EVENT_FETCHING) {
        web3 = new Web3(networkInfo.transportHttp)
      } else {
        web3 = Web3Wrapper.getInstance(networkInfo.id)
      }
      web3._rb = networkInfo
    }
  }

  const poolApi = new PoolApi(web3)

  const vaultAddress = vaultDetails[0][0]
  let fromBlock
  switch (networkInfo.id) {
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
    poolApi.contract.vaulteventful.init(),
    poolApi.contract.vault.init(vaultAddress)
  ]).catch(e => new Error(e))

  //
  // Getting vault data, creation date, supply, ETH balances
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
    return web3.eth.getBlockNumber().then(async lastBlock => {
      let chunck = 250000
      lastBlock = new BigNumber(lastBlock).toNumber()
      const chunks = await getBlockChunks(fromBlock, lastBlock, chunck)
      arrayPromises = chunks.map(async chunk => {
        // Pushing chunk logs into array
        let options = {
          topics: topics,
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock
        }
        return await poolApi.contract.vaulteventful
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
                    date = '01 January 1970'
                  }
                  return date
                })
                .catch(error => {
                  console.warn(error)
                  throw new Error(error)
                })
            } else {
              return '01 January 1970'
            }
          } else {
            return '01 January 1970'
          }
        })
        .catch(error => {
          console.warn(error)
          throw Error(error)
        })
    })
  }

  if (options.dateOnly) {
    let vaultCreated = await getVaultCreationDate(vaultAddress)
    let details = {
      address: vaultAddress,
      created: vaultCreated
    }
    return details
  }

  let balanceDRG = new BigNumber(0)
  let vaultData = poolApi.contract.vault.getData()
  let vaultAdminData = poolApi.contract.vault.getAdminData()
  let vaultTotalSupply = poolApi.contract.vault.totalSupply()
  let vaultETH = poolApi.contract.vault.getBalance()
  let fee = ''

  //
  // Getting balance for each user account
  //
  if (accounts.length > 1) {
    balanceDRG = Promise.all(
      accounts.map(async account => {
        const balance = await poolApi.contract.vault
          .balanceOf(account.address)
          .catch(e => new Error(e))
        balanceDRG = balanceDRG.plus(balance)
      })
    )
  } else {
    balanceDRG = poolApi.contract.vault.balanceOf(accounts[0].address)
  }

  try {
    vaultData = await vaultData
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    vaultAdminData = await vaultAdminData
    fee = new BigNumber(vaultAdminData[4]).div(100).toFixed(2)
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    vaultTotalSupply = await vaultTotalSupply
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  try {
    vaultETH = await vaultETH
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

  // ;[
  //   vaultData,
  //   vaultAdminData,
  //   vaultTotalSupply,
  //   vaultETH,
  //   vaultCreatedDate
  // ] = await Promise.all([
  //   vaultData,
  //   vaultAdminData,
  //   vaultTotalSupply,
  //   vaultETH,
  //   vaultCreatedDate
  // ]).catch(e => new Error(e))

  // let sellPrice = ethers.utils.bigNumberify(vaultData[2]).toHexString()
  // let buyPrice = ethers.utils.bigNumberify(vaultData[3]).toHexString()

  // sellPrice = api.utils.fromWei(sellPrice)
  // buyPrice = api.utils.fromWei(buyPrice)

  // sellPrice = new BigNumber(sellPrice).toFormat(4)
  // buyPrice = new BigNumber(buyPrice).toFormat(4)

  let sellPrice = formatEth(vaultData[2], 4)
  let buyPrice = formatEth(vaultData[3], 4)

  let details = {
    address: vaultDetails[0][0],
    name:
      vaultDetails[0][1].charAt(0).toUpperCase() + vaultDetails[0][1].slice(1),
    symbol: vaultDetails[0][2],
    vaultId: new BigNumber(vaultDetails[0][3]).toNumber(),
    addressOwner: vaultDetails[0][4],
    addressGroup: vaultDetails[0][5],
    sellPrice,
    buyPrice,
    // created: vaultCreatedDate,
    totalSupply: formatCoins(new BigNumber(vaultTotalSupply), 4),
    vaultETHBalance: formatEth(vaultETH, 4),
    fee,
    balanceDRG: formatCoins(balanceDRG, 4)
  }

  return details
}
