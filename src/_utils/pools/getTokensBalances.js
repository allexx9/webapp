import { BigNumber } from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'

export const getTokensBalances = async (dragoAddress, allowedTokens, web3) => {
  let dragoAssets = {}
  const poolApi = new PoolApi(web3)
  try {
    poolApi.contract.drago.init(dragoAddress)
  } catch (err) {
    console.warn(err)
    throw new Error(err)
  }

  let tokenAddresses = []
  let tokenWrappersAddresses = []

  Object.keys(allowedTokens).forEach(token => {
    if (web3.utils.isAddress(allowedTokens[token].address)) {
      let address = allowedTokens[token].address
      tokenAddresses.push(address)
    }
    if (typeof allowedTokens[token].wrappers.Ethfinex !== 'undefined') {
      let address = allowedTokens[token].wrappers.Ethfinex.address
      if (web3.utils.isAddress(address)) {
        tokenWrappersAddresses.push(address)
      }
    }
  })

  // Getting token balances
  let tokenBalances = poolApi.contract.drago.getMultiBalancesAndAddressesFromAddresses(
    tokenAddresses
  )

  // Getting token wrappers balances
  let tokenWrappersBalances = poolApi.contract.drago.getMultiBalancesAndAddressesFromAddresses(
    tokenWrappersAddresses
  )

  ;[tokenBalances, tokenWrappersBalances] = await Promise.all([
    tokenBalances,
    tokenWrappersBalances
  ])

  tokenBalances.tokenAddresses = tokenBalances.tokenAddresses.map(address =>
    address.toLowerCase()
  )
  tokenWrappersBalances.tokenAddresses = tokenWrappersBalances.tokenAddresses.map(
    address => address.toLowerCase()
  )
  for (let token in allowedTokens) {
    let tokenAddress = allowedTokens[token].address.toLowerCase()
    if (tokenAddress !== '0x0') {
      let balances = {
        token: new BigNumber(0),
        wrappers: {},
        total: new BigNumber(0)
      }
      let balanceIndex
      let total = new BigNumber(0)

      // Adding token balance

      balanceIndex = tokenBalances.tokenAddresses.indexOf(tokenAddress)
      if (balanceIndex !== -1) {
        balances.token = new BigNumber(tokenBalances.balances[balanceIndex])
        // console.log(token, balances.token)
        total = total.plus(balances.token)
      }

      // Adding token wrapper balance
      for (let wrapper in allowedTokens[token].wrappers) {
        let wrapperAddess = allowedTokens[token].wrappers[
          wrapper
        ].address.toLowerCase()
        balanceIndex = tokenWrappersBalances.tokenAddresses.indexOf(
          wrapperAddess
        )
        if (balanceIndex !== -1) {
          balances.wrappers[wrapper] = new BigNumber(
            tokenWrappersBalances.balances[balanceIndex]
          )
          // console.log(token, tokenWrappersBalances.balances[balanceIndex])
          total = total.plus(balances.wrappers[wrapper])
        }
      }
      if (!total.eq(0)) {
        balances.total = new BigNumber(total)
        dragoAssets[token] = Object.assign({}, allowedTokens[token])
        dragoAssets[token].balances = Object.assign({}, balances)
      }
    }
  }

  return dragoAssets
}
