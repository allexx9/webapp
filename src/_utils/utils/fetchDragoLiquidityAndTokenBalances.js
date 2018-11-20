// import * as abis from '../PoolsApi/src/contracts/abi'
import BigNumber from 'bignumber.js'
import PoolApi from '../PoolsApi/src'
import Web3Wrapper from '../web3Wrapper/src'

export const fetchDragoLiquidityAndTokenBalances = async (
  dragoAddress,
  api,
  selectedTokensPair,
  exchange
) => {
  let newWeb3 = await Web3Wrapper.getInstance(api._rb.network.id)
  newWeb3._rb = window.web3._rb
  const poolApi = new PoolApi(newWeb3)
  poolApi.contract.drago.init(dragoAddress)
  let { baseTokenLockWrapExpire, quoteTokenLockWrapExpire } = selectedTokensPair
  let dragoETHBalance = await poolApi.contract.drago.getBalance()
  // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),
  let baseTokenBalance = await (selectedTokensPair.baseToken.address !== '0x0'
    ? await poolApi.contract.drago.getBalanceToken(
        selectedTokensPair.baseToken.address
      )
    : await poolApi.contract.drago.getBalance())

  let quoteTokenBalance = await (selectedTokensPair.quoteToken.address !== '0x0'
    ? await poolApi.contract.drago.getBalanceToken(
        selectedTokensPair.quoteToken.address
      )
    : await poolApi.contract.drago.getBalance())

  let baseTokenWrapperBalance,
    quoteTokenWrapperBalance = new BigNumber(0)
  if (exchange.isTokenWrapper) {
    // Getting token wrapper balance
    baseTokenWrapperBalance = await poolApi.contract.drago.getBalanceToken(
      selectedTokensPair.baseToken.wrappers[exchange.name].address
    )
    quoteTokenWrapperBalance = await poolApi.contract.drago.getBalanceToken(
      selectedTokensPair.quoteToken.wrappers[exchange.name].address
    )
    // Getting token wrapper lock time
    baseTokenLockWrapExpire = await utils.updateTokenWrapperLockTime(
      api,
      selectedTokensPair.baseToken.wrappers[exchange.name].address,
      dragoAddress
    )
    // console.log(
    //   `Exp base token: ${moment
    //     .unix(baseTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    quoteTokenLockWrapExpire = await utils.updateTokenWrapperLockTime(
      api,
      selectedTokensPair.quoteToken.wrappers[exchange.name].address,
      dragoAddress
    )
    //   console.log(
    //   `Exp quote token: ${moment
    //     .unix(quoteTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
  }
  const liquidity = {
    dragoETHBalance,
    // dragoZRXBalance: await poolApi.contract.drago.getBalanceZRX(),
    baseTokenBalance,
    baseTokenWrapperBalance,
    quoteTokenBalance,
    quoteTokenWrapperBalance,
    baseTokenLockWrapExpire,
    quoteTokenLockWrapExpire
  }
  // console.log(liquidity)
  return liquidity
}
