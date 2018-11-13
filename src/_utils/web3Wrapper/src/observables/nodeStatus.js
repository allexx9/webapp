import { Observable, timer, of } from "rxjs";
import {
  timeout,
  tap,
  switchMap,
  mergeMap,
  retryWhen,
  finalize
} from "rxjs/operators";
import { race } from "rxjs/observable/race";
import BigNumber from "bignumber.js";
import { errorMsg } from "../utils/utils.js";
import Web3 from "web3";

let retryAttemptNodeStatus$ = 0;

const sync$ = transport => {
  let provider = new Web3.providers.WebsocketProvider(transport, {
    timeout: 5000
  });
  let web3 = new Web3(provider);

  let scalingDuration = 4000;
  return Observable.create(observer => {
    web3.eth
      .isSyncing()
      .then(result => {
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
    tap(val => {
      return val;
    }),
    timeout(4000),
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
          return timer(scalingDuration);
        }),
        finalize(() => {
          console.log("We are done!");
        })
      );
    })
  );
};

const nodeStatus$ = transport => {
  return timer(0, 4000).pipe(
    tap(val => {
      return val;
    }),
    switchMap(val => {
      return race(
        timer(4000).pipe(
          tap(val => {
            return val;
          })
        ),
        sync$(transport)
      ).pipe(
        tap(val => {
          return val;
        })
      );
    }),
    tap(val => {
      return val;
    })
  );
};

export default nodeStatus$;
