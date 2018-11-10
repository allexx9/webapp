import Web3 from "web3";
import { Observable, timer, interval } from "rxjs";
import {
  mergeMap,
  retryWhen,
  finalize,
  timeout,
  tap,
  throttle
} from "rxjs/operators";
import eventfull$ from "./observables/eventfull";
import nodeStatus$ from "./observables/nodeStatus";
import newBlock$ from "./observables/newBlock";
import exchangeEfxV0$ from "./observables/exchangeEfx";

let Web3Wrapper = (function() {
  // Instance stores a reference to the Singleton

  let instance;
  let web3;

  const init = async (networkName, protocol) => {
    const endpoints = {
      https: {
        KOVAN: {
          dev: "https://kovan.infura.io/metamask",
          prod: "https://kovan.infura.io/metamask"
        },
        ROPSTEN: {
          dev: "https://ropsten.infura.io/metamask",
          prod: "https://ropsten.infura.io/metamask"
        },
        MAINNET: {
          dev: "https://mainnet.infura.io/metamask",
          prod: "https://mainnet.infura.io/metamask"
        }
      },
      wss: {
        KOVAN: {
          dev: "wss://kovan.infura.io/ws",
          prod: "wss://kovan.infura.io/ws"
        },
        ROPSTEN: {
          dev: "wss://ropsten.infura.io/ws",
          prod: "wss://ropsten.infura.io/ws"
        },
        MAINNET: {
          dev: "wss://mainnet.infura.io/ws",
          prod: "wss://mainnet.infura.io/ws"
        },
        LOCAL: {
          dev: "ws://localhost:8546",
          prod: "ws://localhost:8546"
        }
      }
    };

    networkName = networkName.toUpperCase();
    const transport = endpoints[protocol][networkName].prod;
    let provider = new Web3.providers.WebsocketProvider(transport, {
      timeout: 5000
    });
    web3 = new Web3(provider);

    let retryAttemptWebSocket$ = 0;

    const webSocket$ = Observable.create(observer => {
      provider = new Web3.providers.WebsocketProvider(transport, {
        timeout: 5000
      });
      web3.setProvider(provider);
      provider.on("connect", function(event) {
        console.log("**** WSS connected ****");
        retryAttemptWebSocket$ = 0;
        observer.next(event);
      });
      provider.on("open", function(event) {
        console.log("**** WSS open ****");
        observer.next(event);
      });
      provider.on("data", function(event) {
        console.log("**** WSS data ****");
        observer.next(event);
      });
      provider.on("error", function(event) {
        console.log("**** WSS error ****");
        console.log("**** Attempting to reconnect error... **** ");
        observer.error(event);
      });
      provider.on("end", event => {
        console.log("**** WS end ****");
        console.log("**** Attempting to reconnect end... ****");
        observer.error(event);
      });

      return () => {
        console.log(`**** webSocket$ exit ****`);
      };
    }).pipe(
      tap(val => {
        return val;
      }),
      timeout(120000),
      retryWhen(error => {
        let scalingDuration = 10000;
        return error.pipe(
          throttle(val => interval(2000)),
          mergeMap(error => {
            console.log(error);
            retryAttemptWebSocket$++;
            console.log(
              `**** webSocket$ Attempt ${retryAttemptWebSocket$} ****`
            );
            return timer(scalingDuration);
          }),
          finalize(() => console.log("We are done!"))
        );
      })
    );

    webSocket$.subscribe(() => {});

    return {
      ...web3,
      rb: {
        ob: {
          eventfull$: eventfull$(web3, networkName),
          exchangeEfxV0$: exchangeEfxV0$(web3, networkName)
        },
        endpoint: transport
      },
      ob: {
        nodeStatus$: nodeStatus$(web3),
        newBlock$: newBlock$(web3)
      }
    };
  };

  return {
    getInstance: async function(
      networkName = "MAINNET",
      protocol = "wss",
      options = {}
    ) {
      if (!networkName) {
        throw new Error("networkName needs to be provided");
      }
      if (!instance) {
        instance = await init(networkName, protocol);
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
