import {
  MSG_NETWORK_STATUS_ERROR,
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
  NETWORK_WARNING
} from '../const'
import BigNumber from 'bignumber.js'
import PoolApi from '../../PoolsApi/src'
import Web3 from 'web3'
import utils from '../utils'

export const updateAccounts = async (api, blockNumber, endpoint) => {
  let newEndpoint = {}
  const prevBlockNumber = endpoint.prevBlockNumber
  const prevNonce = endpoint.prevNonce
  let newBlockNumber = new BigNumber(0)
  let notifications = Array(0)
  let fetchTransactions = false
  // Checking if blockNumber is passed by Parity Api or Web3
  if (typeof blockNumber.number !== 'undefined') {
    newBlockNumber = new BigNumber(blockNumber.number)
  } else {
    newBlockNumber = blockNumber
  }


  // console.log(`endpoint_epic -> Last nonce: ` + prevNonce)

  if (new BigNumber(prevBlockNumber).gte(new BigNumber(newBlockNumber))) {
    console.log(
      `endpoint_epic -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`
    )
    newEndpoint = {
      prevBlockNumber: prevBlockNumber
    }
    return [newEndpoint, notifications, fetchTransactions]
  }

  const prevAccounts = [].concat(endpoint.accounts)
  if (prevAccounts.length !== 0) {
    let newNonce
    try {
      newNonce = await api.eth
        .getTransactionCount(prevAccounts[0].address)
        .catch(err => err)
    } catch (err) {
      console.warn(`Error getTransactionCount`)
      return new Error(err)
    }

    newNonce = new BigNumber(newNonce).toFixed()
    // console.log(`endpoint_epic -> New nonce: ` + newNonce)
    try {
      const poolApi = new PoolApi(api)
      await poolApi.contract.rigotoken.init()

      // Checking GRG balance
      const grgQueries = prevAccounts.map(account => {
        return poolApi.contract.rigotoken
          .balanceOf(account.address)
          .catch(err => {
            console.warn('Error grgQueries')
            return new Error(err)
          })
      })

      // Checking ETH balance
      const ethQueries = prevAccounts.map(account => {
        return api.eth.getBalance(account.address, 'latest').catch(err => {
          console.warn('Error ethQueries')
          return new Error(err)
        })
      })

      let ethBalances
      let grgBalances
      try {
        ethBalances = await Promise.all(ethQueries).catch(err => err)
        grgBalances = await Promise.all(grgQueries).catch(err => err)
      } catch (err) {
        console.warn(err)
        return new Error(err)
      }
      // const prevAccounts = [].concat(endpoint.accounts)
      prevAccounts.forEach(function(account, index) {
        // Checking ETH balance
        const newEthBalance = new BigNumber(ethBalances[index])
        const prevEthBalance = new BigNumber(account.ethBalanceWei)
        // console.log(
        //   `Old balance at block ${prevBlockNumber} -> ${prevEthBalance.toFixed()}`
        // )
        // console.log(
        //   `New balance at block ${newBlockNumber} -> ${newEthBalance.toFixed()}`
        // )
        if (
          !new BigNumber(newEthBalance).eq(prevEthBalance) &&
          Number(prevBlockNumber) !== 0 &&
          Number(prevNonce) !== 0
        ) {

          fetchTransactions = true
          let secondaryText = []
          let balDifference = prevEthBalance.minus(newEthBalance)
          const balDifString = new BigNumber(
            Web3.utils.fromWei(balDifference.toString(16))
          ).toFixed(3)
          if (balDifference.gt(new BigNumber(0))) {

            secondaryText[0] = `You transferred ${balDifString} ETH!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          } else {
            console.log(
              `endpoint_epic -> You received ${Math.abs(balDifString)} ETH!`
            )
            secondaryText[0] = `You received ${Math.abs(balDifString)} ETH!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          }
          if (endpoint.accountsBalanceError === false) {
            notifications.push({
              primaryText: account.name,
              secondaryText: secondaryText,
              eventType: 'transfer'
            })
          }
        }

        // Checking GRG balance
        const newgrgBalance = new BigNumber(grgBalances[index])
        const prevGrgBalance = new BigNumber(account.grgBalanceWei)
        // console.log(newgrgBalance, prevGrgBalance)
        if (
          !new BigNumber(newgrgBalance).eq(prevGrgBalance) &&
          Number(prevBlockNumber) !== 0 &&
          Number(prevNonce) !== 0
        ) {

          fetchTransactions = true
          let secondaryText = []
          let balDifference = prevGrgBalance.minus(newgrgBalance)
          const balDifString = new BigNumber(
            Web3.utils.fromWei(balDifference.toString(16))
          ).toFixed(3)
          if (balDifference.gt(new BigNumber(0))) {

            secondaryText[0] = `You transferred ${balDifString} GRG!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          } else {
            console.log(
              `endpoint_epic -> You received ${Math.abs(balDifString)} GRG!`
            )
            secondaryText[0] = `You received ${Math.abs(balDifString)} GRG!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          }
          if (endpoint.accountsBalanceError === false) {
            notifications.push({
              primaryText: account.name,
              secondaryText: secondaryText,
              eventType: 'transfer'
            })
          }
        }
      })
      newEndpoint = {
        prevBlockNumber: newBlockNumber.toFixed(),
        prevNonce: newNonce,
        loading: false,
        networkError: NETWORK_OK,
        networkStatus: MSG_NETWORK_STATUS_OK,
        accountsBalanceError: false,
        grgBalance: grgBalances.reduce(
          (total, balance) => total.plus(balance),
          new BigNumber(0)
        ),
        ethBalance: ethBalances.reduce(
          (total, balance) => total.plus(balance),
          new BigNumber(0)
        ),
        accounts: [].concat(
          prevAccounts.map((account, index) => {
            let newAccount = { ...account }
            const ethBalance = ethBalances[index]
            newAccount.ethBalance = new BigNumber(
              Web3.utils.fromWei(ethBalance)
            ).toFixed(3)
            newAccount.ethBalanceWei = new BigNumber(ethBalance)
            const grgBalance = grgBalances[index]
            newAccount.grgBalance = new BigNumber(
              Web3.utils.fromWei(grgBalance)
            ).toFixed(3)
            newAccount.grgBalanceWei = new BigNumber(grgBalance)
            return newAccount
          })
        )
      }
      return [newEndpoint, notifications, fetchTransactions]
    } catch (error) {
      console.warn(`endpoint_epic -> ${error}`)
      // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
      newEndpoint = {
        prevBlockNumber: newBlockNumber.toFixed(),
        loading: false,
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR,
        accountsBalanceError: true
      }
      return [newEndpoint, notifications, fetchTransactions]
    }
  } else {
    const newEndpoint = { ...endpoint }
    newEndpoint.loading = false
    newEndpoint.prevBlockNumber = newBlockNumber.toFixed()
    return [newEndpoint, notifications, fetchTransactions]
  }
}
