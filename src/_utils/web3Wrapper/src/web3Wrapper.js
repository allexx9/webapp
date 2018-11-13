import Web3 from "web3";
import eventfull$ from "./observables/eventfull";
import nodeStatus$ from "./observables/nodeStatus";
import newBlock$ from "./observables/newBlock";
import exchangeEfxV0$ from "./observables/exchangeEfx";
import webSocket$ from "./observables/webSocket";
import contract from "./utils/contract";
import { ENDPOINTS } from "./utils/const";
import { newWeb3 } from "./utils/utils";

let Web3Wrapper = (() => {
  // Instance stores a reference to the Singleton

  let instance;
  let web3;

  const init = async (networkId, protocol = "wss") => {
    const transport = ENDPOINTS[protocol][networkId].prod;
    let provider = new Web3.providers.WebsocketProvider(transport, {
      timeout: 5000
    });
    web3 = newWeb3(provider);
    webSocket$(web3, newWeb3, transport).subscribe(status => {
      console.log(status);
    });
    return {
      ...web3,
      rb: {
        ob: {
          eventfull$: eventfull$(web3, networkId),
          exchangeEfxV0$: exchangeEfxV0$(web3, networkId)
        },
        utils: { contract },
        endpoint: transport
      },
      ob: {
        nodeStatus$: nodeStatus$(transport),
        newBlock$: newBlock$(web3, transport)
      }
    };
  };

  return {
    getInstance: async (networkId, protocol) => {
      if (!networkId) {
        throw new Error("networkId needs to be provided");
      }
      if (!instance) {
        instance = await init(networkId, protocol);
      } else {
      }
      return instance;
    }
  };
})();

export default Web3Wrapper;

// Web3Wrapper.getInstance('LOCAL').then(instance => {
//   instance.nodeStatus$.subscribe(val => {
//     console.log(JSON.stringify(val))
//   })
//   instance.newBlock$.subscribe(val => {
//     console.log(val.number)
//     // console.log(JSON.stringify(val))
//   })
// })
