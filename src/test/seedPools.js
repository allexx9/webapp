import { GANACHE_NETWORK_ID, GAS_ESTIMATE } from './constants'
import { poolsList } from './dragoList'
import Web3 from 'web3'
import dragoArtifact from '@rigoblock/contracts/artifacts/Drago.json'
import vaultArtifact from '@rigoblock/contracts/artifacts/Vault.json'
// import fetchContracts from '@rigoblock/contracts'
import { toBaseUnitAmount } from '../_utils/format'
import BigNumber from 'bignumber.js'

export const seedPools = (poolType, baseContracts) =>
  poolType === 'Drago' ? seedDragos(baseContracts) : seedVaults(baseContracts)

const seedVaults = async baseContracts => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8545')
  )
  const accounts = await web3.eth.getAccounts()
  const optionsDefault = {
    gas: GAS_ESTIMATE,
    gasPrice: 1
  }

  const promisesArray = poolsList.vaults.map(async vault => {
    await baseContracts['VaultFactory'].createVault(vault.name, vault.symbol)
    const [
      id,
      address,
      symbol,
      vaultId,
      addressOwner,
      addressGroup
    ] = await baseContracts['DragoRegistry'].fromName(vault.name)
    const vaultInstance = new web3.eth.Contract(
      vaultArtifact.networks[GANACHE_NETWORK_ID].abi,
      address
    )

    for (let i = 0; i < 5; i++) {
      await vaultInstance.methods.buyVault().send({
        ...optionsDefault,
        from: accounts[i],
        value: Web3.utils.toWei(vault.supply.toString(), 'ether')
      })
    }

    let totalSupply = await vaultInstance.methods.totalSupply().call()
    let vaultETHBalance = await web3.eth.getBalance(address)
    return {
      address: address.toLowerCase(),
      name: vault.name,
      symbol,
      vaultId: vaultId.toFixed(),
      totalSupply,
      sellPrice: '1.0000',
      buyPrice: '1.0000',
      addressOwner,
      addressGroup,
      vaultETHBalance
    }
  })
  let list = await Promise.all(promisesArray)
  console.log(list)
  return list

  // let list = []
  // const seedPromises = promisesArray.reduce(
  //   (p, fn) =>
  //     p.then(result => {
  //       list.push(result)
  //       return fn
  //     }),
  //   Promise.resolve(promisesArray.shift())
  // )
  // return seedPromises
  //   .then(result => {
  //     list.push(result)
  //     console.log(list)
  //     return list
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })
}

const seedDragos = async baseContracts => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8545')
  )
  const accounts = await web3.eth.getAccounts()
  const optionsDefault = {
    gas: GAS_ESTIMATE,
    gasPrice: 1
  }

  const promisesArray = poolsList.dragos.map(async drago => {
    await baseContracts['DragoFactory'].createDrago(drago.name, drago.symbol)
    const [
      id,
      address,
      symbol,
      dragoId,
      addressOwner,
      addressGroup
    ] = await baseContracts['DragoRegistry'].fromName(drago.name)
    const dragoInstance = new web3.eth.Contract(
      dragoArtifact.networks[GANACHE_NETWORK_ID].abi,
      address
    )

    for (let i = 0; i < 5; i++) {
      await dragoInstance.methods.buyDrago().send({
        ...optionsDefault,
        from: accounts[i],
        value: Web3.utils.toWei(drago.supply.toString(), 'ether')
      })
    }

    // Get some WETH9
    const tokenAddress = null
    const tokenWrapper = await baseContracts['WETH9'].address
    const wrapAmount = '1.1000'
    let toBeWrapped =
      '0x' + toBaseUnitAmount(new BigNumber(wrapAmount), 18).toString(16)

    await baseContracts['ExchangesAuthority'].whitelistWrapper(
      tokenWrapper,
      true
    )
    await baseContracts['ExchangesAuthority'].whitelistTokenOnWrapper(
      tokenAddress,
      tokenWrapper,
      true
    )

    const methodInterface = {
      name: 'wrapEth',
      type: 'function',
      inputs: [
        {
          type: 'address',
          name: 'wrapper'
        },
        {
          type: 'uint256',
          name: 'amount'
        }
      ]
    }
    const assembledTransaction = await web3.eth.abi.encodeFunctionCall(
      methodInterface,
      [tokenWrapper, toBeWrapped]
    )
    const methodSignature = await web3.eth.abi.encodeFunctionSignature(
      methodInterface
    )
    const weth9AdapterAddress = await baseContracts['AWeth'].address
    await baseContracts['ExchangesAuthority'].whitelistMethod(
      methodSignature,
      weth9AdapterAddress,
      true
    )
    await dragoInstance.methods
      .operateOnExchange(tokenWrapper, [assembledTransaction])
      .send({ ...optionsDefault, from: accounts[0] })

    let totalSupply = await dragoInstance.methods.totalSupply().call()
    let dragoETHBalance = await web3.eth.getBalance(address)
    return {
      address: address.toLowerCase(),
      name: drago.name,
      symbol,
      dragoId: dragoId.toFixed(),
      totalSupply,
      sellPrice: '1.0000',
      buyPrice: '1.0000',
      addressOwner,
      addressGroup,
      dragoETHBalance,
      dragoWETHBalance: toBaseUnitAmount(new BigNumber(wrapAmount), 18)
    }
  })
  let list = await Promise.all(promisesArray)
  console.log(list)
  return list
  // let list = []
  // const seedPromises = promisesArray.reduce(
  //   (p, fn) =>
  //     p.then(result => {
  //       list.push(result)
  //       return fn
  //     }),
  //   Promise.resolve(promisesArray.shift())
  // )
  // return seedPromises
  //   .then(result => {
  //     list.push(result)
  //     console.log(list)
  //     return list
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })
}
