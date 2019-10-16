import { getWeb3 } from '../misc'
import PoolApi from '../../PoolsApi/src'

export const getPoolsGroupDetails = async (poolsIdArray, networkInfo) => {
  const web3 = getWeb3(networkInfo)
  const poolApi = new PoolApi(web3)
  await poolApi.contract.dragoregistry.init()
  const poolsArray = await poolApi.contract.dragoregistry.queryMultiDataFromId(
    poolsIdArray
  )
  return poolsArray
}
