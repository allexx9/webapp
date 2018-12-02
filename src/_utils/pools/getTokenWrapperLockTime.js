import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'

export const getTokenWrapperLockTime = async (
  web3,
  tokenAddress,
  accountAddress
) => {
  const poolApi = new PoolApi(web3)
  await poolApi.contract.tokenwrapper.init(tokenAddress)
  const depositLockTime = await poolApi.contract.tokenwrapper.depositLock(
    accountAddress
  )
  return new BigNumber(depositLockTime).toFixed()
}
