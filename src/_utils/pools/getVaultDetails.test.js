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
      let i = 0
      const options = { dateOnly: false, wallet: '' }
      const expectedVaultDetails = {
        ...vaultList[i]
      }
      expectedVaultDetails.totalSupply = formatCoins(
        new BigNumber(expectedVaultDetails.totalSupply),
        4
      )
      expectedVaultDetails.vaultETHBalance = formatEth(
        expectedVaultDetails.vaultETHBalance,
        4
      )
      expectedVaultDetails.balanceDRG = new BigNumber(
        poolsList.dragos[0].supply * 5 * (i + 1)
      ).toFixed(4)
      let vault = []
      vault.push([
        vaultList[i].address,
        vaultList[i].name,
        vaultList[i].symbol,
        vaultList[i].vaultId,
        vaultList[i].addressOwner,
        vaultList[i].addressGroup
      ])
      const vaultDetails = await getVaultDetails(
        vault,
        accounts,
        networkInfo,
        options
      )
      expect(vaultDetails).toEqual(expectedVaultDetails)
    })
    it('2 -> get only date success', async () => {
      let i = 0
      const options = { dateOnly: true, wallet: '' }
      const expectedDate = {
        address: vaultList[i].address,
        created: dateFromTimeStampHuman(Date.now() / 1000)
      }
      let vault = []
      vault.push([
        vaultList[i].address,
        vaultList[i].name,
        vaultList[i].symbol,
        vaultList[i].dragoId,
        vaultList[i].addressOwner,
        vaultList[i].addressGroup
      ])
      const vaultDetails = await getVaultDetails(
        vault,
        accounts,
        networkInfo,
        options
      )
      expect(vaultDetails).toEqual(expectedDate)
    })
  })
})
