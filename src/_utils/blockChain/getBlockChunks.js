export const blockChunks = (start, end, chunk, web3) => {
  // if (end === 'latest') {
  //   try {
  //     end = await web3.eth.getBlockNumber()
  //   } catch (e) {
  //     return console.error(e)
  //   }
  // }
  end = Number(end)
  chunk = Number(chunk)
  start = Number(start)
  let rangesArray = []
  let i = 0
  let fromBlock = end - chunk
  let toBlock = end

  if (end - chunk < start) {
    rangesArray.push({
      fromBlock: start,
      toBlock: 'latest'
    })
    // console.log(
    //   `***** Chunk ${i} -> fromBlock ${start} -> toBlock ${end} ('latest')`
    // )
    return rangesArray
  }
  while (toBlock > start) {
    if (i === 0) {
      rangesArray.push({
        fromBlock: fromBlock + 1,
        toBlock: 'latest'
      })
    } else {
      rangesArray.push({
        fromBlock: fromBlock + 1,
        toBlock: toBlock
      })
    }
    // console.log(
    //   `***** Chunk ${i} -> fromBlock ${fromBlock + 1} -> toBlock ${toBlock}`
    // )
    i++
    // fromBlock = fromBlock - chunk
    // toBlock = toBlock - chunk
    if (i > 100) break
    if (fromBlock - chunk < start) {
      rangesArray.push({
        fromBlock: Number(start),
        toBlock: fromBlock
      })
      // console.log(
      //   `***** Chunk ${i} -> fromBlock ${Number(
      //     start
      //   )} -> toBlock ${fromBlock}`
      // )
      break
    }
    fromBlock = fromBlock - chunk
    toBlock = toBlock - chunk
  }
  // logger.info(`${JSON.stringify(rangesArray)}`)
  // rangesArray.map((chunk, key) => {
  //   // console.log(
  //   //   `***** Chunk ${key} -> fromBlock ${chunk.fromBlock} -> toBlock ${
  //   //     chunk.toBlock
  //   //   }`
  //   // )
  // })
  return rangesArray
}

export const getBlockChunks = async (start, end, chunkSize, web3) => {
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
    chunks.push({ fromBlock, toBlock })
  }
  return chunks.reverse()
}
