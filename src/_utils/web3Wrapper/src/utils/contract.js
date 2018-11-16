import { getBlockChunks } from '../utils/utils'

const contract = contract => ({
  getAllLogs: async options => {
    let arrayPromises = []
    let chunkSize = 100000
    const chunks = getBlockChunks(options.fromBlock, options.toBlock, chunkSize)
    arrayPromises = chunks.map(async ({ fromBlock, toBlock }) =>
      contract.getAllLogs({
        topics: options.topics,
        fromBlock,
        toBlock
      })
    )
    const results = await Promise.all(arrayPromises)
    return results
  }
})

export default contract
