import { formatCoins, formatEth } from '../format'
import { getDragoDetails } from './getDragoDetails'
import { poolsList } from '../../test/dragoList'
import BigNumber from 'bignumber.js'

const contractName = 'Drago'
const networkInfo = { id: 5777 }

beforeEach = async () => {}

describeContract(contractName, () => {
  describe('getDragoDetails test', () => {
    it('Correctly getDragoDetails test', async () => {
      const options = { dateOnly: false, wallet: '' }
      const expectedDragoDetails = {
        ...dragoList[0]
      }
      expectedDragoDetails.totalSupply = formatCoins(
        new BigNumber(expectedDragoDetails.totalSupply),
        4
      )
      expectedDragoDetails.dragoETHBalance = formatEth(
        expectedDragoDetails.dragoETHBalance,
        4
      )
      expectedDragoDetails.dragoWETHBalance = formatEth(
        expectedDragoDetails.dragoWETHBalance,
        4
      )
      expectedDragoDetails.balanceDRG = new BigNumber(
        poolsList.dragos[0].supply * 5
      ).toFixed(4)
      let drago = []
      drago.push([
        dragoList[0].address,
        dragoList[0].name,
        dragoList[0].symbol,
        dragoList[0].dragoId,
        dragoList[0].addressOwner,
        dragoList[0].addressGroup
      ])
      const dragoDetails = await getDragoDetails(
        drago,
        accounts,
        networkInfo,
        options
      )
      expect(expectedDragoDetails).toEqual(dragoDetails)
    })
  })
})
