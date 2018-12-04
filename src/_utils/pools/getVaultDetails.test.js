import { dateFromTimeStampHuman } from '../misc/dateFromTimeStampHuman'
import { formatCoins, formatEth } from '../format'
import { getVaultDetails } from './getVaultDetails'
import { poolsList } from '../../test/dragoList'
import BigNumber from 'bignumber.js'

const contractName = ''
const networkInfo = { id: 5777 }

beforeEach = async () => {}

describeContract(contractName, () => {
  describe('Get Vault details', () => {
    it('1 -> get full details success', async () => {
      const options = { dateOnly: false, wallet: '' }
      const expectedVaultDetails = {
        ...vaultList[0]
      }
      expectedVaultDetails.totalSupply = formatCoins(
        new BigNumber(expectedVaultDetails.totalSupply),
        4
      )
      expectedVaultDetails.dragoETHBalance = formatEth(
        expectedVaultDetails.dragoETHBalance,
        4
      )
      expectedVaultDetails.balanceDRG = new BigNumber(
        poolsList.dragos[0].supply * 5
      ).toFixed(4)
      let vault = []
      vault.push([
        vaultList[0].address,
        vaultList[0].name,
        vaultList[0].symbol,
        vaultList[0].vaultId,
        vaultList[0].addressOwner,
        vaultList[0].addressGroup
      ])
      const vaultDetails = await getVaultDetails(
        vault,
        accounts,
        networkInfo,
        options
      )
      expect(expectedVaultDetails).toEqual(vaultDetails)
    })
    it('2 -> get only date success', async () => {
      const options = { dateOnly: true, wallet: '' }
      const expectedDate = {
        address: vaultList[0].address,
        created: dateFromTimeStampHuman(Date.now() / 1000)
      }
      let vault = []
      vault.push([
        vaultList[0].address,
        vaultList[0].name,
        vaultList[0].symbol,
        vaultList[0].dragoId,
        vaultList[0].addressOwner,
        vaultList[0].addressGroup
      ])
      const vaultDetails = await getDragoDetails(
        vault,
        accounts,
        networkInfo,
        options
      )
      expect(expectedDate).toEqual(vaultDetails)
    })
  })
})
