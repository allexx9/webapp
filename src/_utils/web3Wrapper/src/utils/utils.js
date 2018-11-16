import Web3 from 'web3'

export const newWeb3 = provider => {
  return new Web3(provider)
}

export const errorMsg = error => {
  return error.charAt(0).toUpperCase() + error.slice(1)
}

export const blockChunks = async (start, end, chunkSize, web3) => {
  const startBlock = start
  const chunks = []
  let endBlock = end
  if (endBlock === 'latest') {
    try {
      endBlock = await web3.eth.getBlockNumber()
    } catch (e) {
      return console.error(e)
    }
  }
  for (let i = startBlock - 1; i < endBlock; i += chunkSize) {
    const fromBlock = i + 1
    const toBlock = i + chunkSize > endBlock ? end : i + chunkSize
    chunks.push([fromBlock, toBlock])
  }
  return chunks
}
