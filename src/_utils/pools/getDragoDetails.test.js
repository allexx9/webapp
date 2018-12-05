import { dateFromTimeStampHuman } from '../misc/dateFromTimeStampHuman'
import { formatCoins, formatEth } from '../format'
import { getDragoDetails } from './getDragoDetails'
import { poolsList } from '../../test/dragoList'
import BigNumber from 'bignumber.js'

const contractName = 'Drago'
const networkInfo = { id: 5777 }

beforeEach = async () => {
  jest.setTimeout(30000)
}

describeContract(contractName, () => {
  describe('Get Drago details', () => {
    it('1 -> get full details success', async () => {
      let i = 0
      const options = { dateOnly: false, wallet: '' }
      const expectedDragoDetails = {
        ...dragoList[i]
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
      // Balance owned by the account
      expectedDragoDetails.balanceDRG = new BigNumber(
        poolsList.dragos[0].supply * 5 * (i + 1)
      ).toFixed(4)
      expectedDragoDetails.sellPrice = new BigNumber(
        expectedDragoDetails.sellPrice
      ).toFixed(4)
      expectedDragoDetails.buyPrice = new BigNumber(
        expectedDragoDetails.buyPrice
      ).toFixed(4)
      let drago = []
      drago.push([
        dragoList[i].address,
        dragoList[i].name,
        dragoList[i].symbol,
        dragoList[i].dragoId,
        dragoList[i].addressOwner,
        dragoList[i].addressGroup
      ])
      const dragoDetails = await getDragoDetails(
        drago,
        accounts,
        networkInfo,
        options
      )
      expect(dragoDetails).toEqual(expectedDragoDetails)
    })
    it('2 -> get only date success', async () => {
      let i = 0
      const options = { dateOnly: true, wallet: '' }
      const expectedDate = {
        address: dragoList[i].address,
        created: dateFromTimeStampHuman(Date.now() / 1000)
      }
      let drago = []
      drago.push([
        dragoList[i].address,
        dragoList[i].name,
        dragoList[i].symbol,
        dragoList[i].dragoId,
        dragoList[i].addressOwner,
        dragoList[i].addressGroup
      ])
      const dragoDetails = await getDragoDetails(
        drago,
        accounts,
        networkInfo,
        options
      )
      expect(dragoDetails).toEqual(expectedDate)
    })
  })
})
