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
  let connStatus = false;

  const init = async (networkId, protocol = "wss") => {
    const transport = ENDPOINTS[protocol][networkId].prod;
    let provider = new Web3.providers.WebsocketProvider(transport, {
      timeout: 5000
    });
    // let provider = window.web3
    web3 = newWeb3(provider);
    // connStatus = await web3.eth.net.isListening();
    web3.connStatus = connStatus;
    webSocket$(web3, newWeb3, transport, provider).subscribe(status => {
      // console.log(status);
    });
    return {
      ...web3,
      rb: {
        connStatus,
        ob: {
          eventfull$: eventfull$(web3, networkId),
          exchangeEfxV0$: exchangeEfxV0$(web3, networkId, provider)
        },
        utils: { contract: contract(web3) },
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
