import { formatCoins, formatEth } from './../format'
import { getWeb3 } from '../misc'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'

export const getPoolsGroupDetails = async (poolsIdArray, networkInfo) => {
  //
  // Initializing Drago API
  //

  let web3 = getWeb3(networkInfo)

  const poolApi = new PoolApi(web3)

  await poolApi.contract.dragoregistry.init()

  const poolsArray = await poolApi.contract.dragoregistry.queryMultiDataFromId(
    poolsIdArray
  )

  //
  // Getting drago data, creation date, supply, ETH balances
  //

  console.log(poolsArray)
  return poolsArray

  // let balanceDRG = new BigNumber(0)
  // let dragoData = poolApi.contract.drago.getData()
  // let dragoTotalSupply = poolApi.contract.drago.totalSupply()
  // let dragoETH = poolApi.contract.drago.getBalance()
  // let dragoWETH = poolApi.contract.drago.getBalanceWETH()

  // let sellPrice = formatEth(dragoData[2], 4)
  // let buyPrice = formatEth(dragoData[3], 4)

  // let details = {
  //   address: dragoDetails[0][0],
  //   name:
  //     dragoDetails[0][1].charAt(0).toUpperCase() + dragoDetails[0][1].slice(1),
  //   symbol: dragoDetails[0][2],
  //   dragoId: new BigNumber(dragoDetails[0][3]).toFixed(),
  //   addressOwner: dragoDetails[0][4],
  //   addressGroup: dragoDetails[0][5],
  //   sellPrice,
  //   buyPrice,
  //   totalSupply: formatCoins(new BigNumber(dragoTotalSupply), 4),
  //   totalSupplyBaseUnits: BigNumber(dragoTotalSupply),
  //   dragoETHBalance: formatEth(dragoETH, 4),
  //   dragoETHBalanceWei: new BigNumber(dragoETH),
  //   dragoWETHBalance: formatEth(dragoWETH, 4),
  //   balanceDRG: formatCoins(balanceDRG, 4)
  // }

  // return details
}
