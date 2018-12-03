import { getDragoDetails } from './getDragoDetails'
import Web3 from 'web3'

const contractName = 'Drago'
const networkInfo = { id: 5777 }

beforeEach = async () => {
  // const web3 = new Web3(
  //   new Web3.providers.HttpProvider('http://localhost:8545')
  // )
  // accounts = await web3.eth.getAccounts()
}

describeContract(contractName, () => {
  describe('getDragoDetails test', () => {
    it('Correctly getDragoDetails test', async () => {
      const options = { dateOnly: false, wallet: '' }
      console.log(dragoList[0].address)
      console.log(accounts)
      let drago = []
      drago.push([
        dragoList[0].address,
        dragoList[0].name,
        dragoList[0].symbol,
        dragoList[0].dragoId,
        dragoList[0].owner,
        dragoList[0].group
      ])
      console.log(drago[0][0])
      // const dragoDetails = await getDragoDetails(
      //   drago,
      //   accounts,
      //   networkInfo,
      //   options
      // )
      // console.log(dragoDetails)
      // console.log(dragoDetails)
      // expect(ownerAddress).toBe(true)
    })
  })
})
