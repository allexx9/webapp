import { blockChunks, getBlockChunks } from "../utils/utils";

const contract = web3 => {
  return contract => {
    return {
      getPastEvents: async (
        events,
        options = {
          fromBlock: 0,
          toBlock: "latest",
          topics: [null, null, null, null]
        }
      ) => {
        let arrayPromises = [];
        let chunkSize = 100000;
        let endBlock = await web3.eth.getBlockNumber();
        console.log(
          "fromBlock " + 3000000,
          "toBlock " + endBlock,
          "chuckSize " + chunkSize
        );

        const chunks = blockChunks(3000000, endBlock, chunkSize);
        const chunks2 = await getBlockChunks(
          3000000,
          "latest",
          chunkSize,
          web3
        );
        console.log(chunks);
        console.log(chunks2.reverse());
        arrayPromises = chunks.map(async chunk => {
          let chunkOptions = {
            topics: options.topics,
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          };
          console.log(events, chunkOptions);
          return contract.getPastEvents(events, chunkOptions);
        });
        return await Promise.all(arrayPromises).then(results => {
          console.log(results);
          let events = Array(0).concat(...results);
          return events;
        });
      }
    };
  };
};

export default contract;
