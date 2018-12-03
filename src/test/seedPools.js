import { GANACHE_NETWORK_ID, GAS_ESTIMATE } from './constants'
import { poolsList } from './dragoList'
import PoolApi from '../PoolsApi/src'
import Web3 from 'web3'
import dragoArtifact from '@rigoblock/contracts/artifacts/Drago.json'
// import fetchContracts from '@rigoblock/contracts'

export const seedPools = async baseContracts => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8545')
  )
  const accounts = await web3.eth.getAccounts()
  const optionsDefault = {
    gas: GAS_ESTIMATE,
    gasPrice: 1
  }
  // console.log(fetchContracts)
  // const contractsMap = await fetchContracts(5777)
  // console.log(contractsMap)
  let list
  const promiesArray = poolsList.dragos.map(async drago => {
    await baseContracts['DragoFactory'].createDrago(drago.name, drago.symbol)
    const [id, address, symbol, dragoId, owner, group] = await baseContracts[
      'DragoRegistry'
    ].fromName(drago.name)
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

    const WETHaddress = baseContracts['WETH9'].address
    await poolApi.contract.drago.init(address)
    await poolApi.contract.drago.wrapETHZeroEx(
      WETHaddress,
      accounts[0],
      toBaseUnitAmount(new BigNumber('1'), 18).toString(16)
    )
    // Get some WETH9
    // const dragoWETHBalance = await baseContracts['WETH9'].transfer(
    //   drago.address,
    //   Web3.utils.toWei('1', 'ether')
    // )

    console.log(baseContracts['WETH9'])

    let supply = await dragoInstance.methods.totalSupply().call()
    return {
      id: id.toFixed(),
      address: address.toLowerCase(),
      name: drago.name,
      symbol,
      dragoId: dragoId.toFixed(),
      supply: supply,
      owner,
      group
      // dragoWETHBalance
    }
  })
  list = await Promise.all(promiesArray)
  return list
}
