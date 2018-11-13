// const contract = (contract) =>{
//   getAllLogs: (options) => {

//   }
// }
import { blockChunks } from "../utils/utils";

const contract = contract => {
  return {
    getAllLogs: async options => {
      let arrayPromises = [];
      let chunck = 100000;
      const chunks = blockChunks(options.fromBlock, options.toBlock, chunck);
      arrayPromises = chunks.map(async chunk => {
        // Pushing chunk logs into array
        let chunkOptions = {
          topics: options.topics,
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock
        };
        return await contract.getAllLogs(chunkOptions);
      });

      return await Promise.all(arrayPromises).then(results => {
        return results;
      });
    }
  };
};

export default contract;
