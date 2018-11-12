import { timer, of, from } from "rxjs";
import { timeout, map, tap, catchError, exhaustMap } from "rxjs/operators";
import BigNumber from "bignumber.js";
import { errorMsg } from "../utils/utils.js";

export default web3 => {
  let nodeStatus = {
    isConnected: false,
    isSyncing: false,
    syncStatus: {},
    error: {}
  };
  let newNodeStatus;
  let scalingDuration = 1000;
  let timeInterval = 0;
  let retryAttemptNodeStatus$ = 0;

  return timer(0, 2000).pipe(
    exhaustMap(() => {
      return from(
        web3.eth.isSyncing().catch(error => {
          console.log(error);
          throw new Error(errorMsg(error.message));
        })
      ).pipe(
        timeout(2500),
        tap(result => {
          return result;
        }),
        map(result => {
          retryAttemptNodeStatus$ = 0;
          timeInterval = 0;
          if (result !== false) {
            if (
              new BigNumber(result.highestBlock)
                .minus(result.currentBlock)
                .gt(2)
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
          return newNodeStatus;
        }),
        catchError(error => {
          console.log("**** Error nodeStatus$ -> " + error.message + " ****");
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

          return of(newNodeStatus);
        })
      );
    })
  );
};
