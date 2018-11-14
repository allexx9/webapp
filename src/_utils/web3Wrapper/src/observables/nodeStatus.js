import { Observable, timer, of } from "rxjs";
import {
  timeout,
  tap,
  switchMap,
  mergeMap,
  retryWhen,
  finalize,
  filter,
  exhaustMap,
  map
} from "rxjs/operators";
import { race } from "rxjs/observable/race";
import BigNumber from "bignumber.js";
import { errorMsg } from "../utils/utils.js";
import Web3 from "web3";

let retryAttemptNodeStatus$ = 0;
let scalingDuration = 4000;

const sync$ = (web3, transport) => {
  // let provider = new Web3.providers.WebsocketProvider(transport, {
  //   timeout: 5000
  // });
  // let web3 = new Web3(provider);

  return Observable.create(observer => {
    web3.eth
      .isSyncing()
      .then(result => {
        // console.log("*** sync ***");
        retryAttemptNodeStatus$ = 0;
        let nodeStatus = {
          isConnected: false,
          isSyncing: false,
          syncStatus: {},
          error: {}
        };
        let newNodeStatus;
        if (result) {
          if (
            new BigNumber(result.highestBlock).minus(result.currentBlock).gt(2)
          ) {
            newNodeStatus = {
              ...nodeStatus,
              ...{
                isConnected: true,
                isSyncing: true,
                syncStatus: result,
                error: {}
              }
            };
          } else {
            newNodeStatus = {
              ...nodeStatus,
              ...{
                isConnected: true,
                isSyncing: false,
                syncStatus: {},
                error: {}
              }
            };
          }
        } else {
          newNodeStatus = {
            ...nodeStatus,
            ...{
              isConnected: true,
              isSyncing: false,
              syncStatus: {},
              error: {}
            }
          };
        }
        observer.next(newNodeStatus);
        return newNodeStatus;
      })
      .catch(error => {
        // console.log(error);
        let nodeStatus = {
          isConnected: false,
          isSyncing: false,
          syncStatus: {},
          error: {}
        };
        let newNodeStatus;
        let timeInterval;
        retryAttemptNodeStatus$++;
        retryAttemptNodeStatus$ > 5
          ? (timeInterval = scalingDuration * 5)
          : (timeInterval = scalingDuration * retryAttemptNodeStatus$);
        newNodeStatus = {
          ...nodeStatus,
          ...{
            isConnected: false,
            isSyncing: false,
            syncStatus: {},
            error: error.message,
            retryTimeInterval: timeInterval,
            connectionRetries: retryAttemptNodeStatus$
          }
        };

        observer.next(newNodeStatus);
        observer.error(error);
        // throw new Error(errorMsg(error.message));
      });
    return () => {
      // console.log(`**** nodeStatus$ exit ****`);
      of("done");
    };
  }).pipe(
    // timeout(5000),
    tap(val => {
      // console.log(val);
      return val;
    })
    // retryWhen(error => {
    //   return error.pipe(
    //     mergeMap(error => {
    //       console.log(`****  nodeStatus$ error: ${error} ****`);
    //       // console.log(
    //       //   `**** nodeStatus$ Attempt ${retryAttemptNodeStatus$} ****`
    //       // );
    //       // let provider = new Web3.providers.WebsocketProvider(transport, {
    //       //   timeout: 5000
    //       // });
    //       // web3.setProvider(provider);
    //       // newWeb3 = new Web3(provider);
    //       let provider = new Web3.providers.WebsocketProvider(transport);
    //       console.log("creating new web3 provider");
    //       web3 = new Web3(provider);
    //       return timer(scalingDuration);
    //     }),
    //     finalize(() => {
    //       console.log("We are done!");
    //     })
    //   );
    // })
  );
};

const nodeStatus$ = transport => {
  let provider = new Web3.providers.WebsocketProvider(transport);
  let web3 = new Web3(provider);
  return timer(0, 3000).pipe(
    tap(val => {
      // console.log(val);
      return val;
    }),
    switchMap(val => {
      return race(
        // timer(2000, 1000).pipe(
        //   tap(val => {
        //     return val;
        //   })
        // ),
        sync$(web3, transport)
      ).pipe(
        tap(val => {
          // console.log(val);
          return val;
        })
      );
    }),
    timeout(7000),
    tap(val => {
      console.log(val);
      return val;
    }),
    map(val => {
      // console.log(val);
      // if (val) {
      //   return {
      //     isConnected: false,
      //     isSyncing: false,
      //     syncStatus: {},
      //     error: {}
      //   };
      // }
      return val;
    }),
    retryWhen(error => {
      return error.pipe(
        mergeMap(error => {
          console.log(`****  nodeStatus$ error: ${error} ****`);
          // console.log(
          //   `**** nodeStatus$ Attempt ${retryAttemptNodeStatus$} ****`
          // );
          // let provider = new Web3.providers.WebsocketProvider(transport, {
          //   timeout: 5000
          // });
          // web3.setProvider(provider);
          // newWeb3 = new Web3(provider);
          let provider = new Web3.providers.WebsocketProvider(transport);
          console.log("creating new web3 provider end of epic");
          web3 = new Web3(provider);
          return timer(scalingDuration);
        }),
        finalize(() => {
          console.log("We are done!");
        })
      );
    })
    // filter(val =>{

    // })
  );
};

export default nodeStatus$;
