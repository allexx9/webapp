import { getFromBlock } from './getFromBlock'

beforeEach = async () => {}

describe('getFromBlock util', () => {
  it('1 -> it is ganache success', async () => {
    const networkInfo = { id: 5777 }
    const block = getFromBlock(networkInfo)
    expect(block).toBe('0')
  })
  it('2 -> return mainnet success', async () => {
    const networkInfo = { id: 1 }
    const block = getFromBlock(networkInfo)
    expect(block).toBe('6000000')
  })
  it('3 -> return default success', async () => {
    const networkInfo = { id: 100 }
    const block = getFromBlock(networkInfo)
    expect(block).toBe('3000000')
  })
})
