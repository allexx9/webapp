import { Observable, timer, of } from "rxjs";
import {
  timeout,
  mergeMap,
  retryWhen,
  finalize,
  exhaustMap,
  tap
} from "rxjs/operators";
import Web3 from "web3";
import { map } from "most";
import { filter } from "rxjs-compat/operator/filter";

export default (web3, transport) => {
  let subscription = null;
  let retryAttemptNewBlock$ = 0;

  const checkConnection = () => {
    return Observable.create(observer => {
      web3.connStatus ? observer.next(true) : observer.error(true);
      return observer.complete();
    });
  };

  return Observable.create(observer => {
    if (subscription !== null) {
      subscription.unsubscribe(function(error, success) {
        if (success) {
          console.log("**** newBlock$ Successfully UNSUBSCRIBED! ****");
        }
        if (error) {
          console.log("**** newBlock$ UNSUBSCRIBE error ****");
          console.warn(error);
        }
      });
    }
    subscription = web3.eth
      .subscribe("newBlockHeaders", function(error) {
        if (error !== null) {
          console.warn(`****  WS newBlockHeaders error 1 ${error} ****`);
          return observer.error(error);
        }
      })
      .on("data", function(blockHeader) {
        retryAttemptNewBlock$ = 0;
        return observer.next(blockHeader);
      })
      .on("error", function(error) {
        console.warn(`WS newBlockHeaders error 2 ${error}`);
        return observer.error(error);
      })
      .on("end", function(error) {
        console.warn(`WS newBlockHeaders error 3 ${error}`);
        return observer.error(error);
      });
    return () => {
      console.log(subscription);
      subscription.unsubscribe();
      console.log(`**** newBlock$ exit ****`);
    };
  }).pipe(
    // timer(0, 1000).pipe(
    //   exhaustMap(() => {
    //     return true;
    //     // return checkConnection();
    //   }),
    //   tap(val => console.log(val))
    // ),
    // exhaustMap(() => {
    //   return timer(0, 2000).pipe(
    //     exhaustMap(() => {
    //       // return true;
    //       return checkConnection();
    //     }),
    //     tap(val => console.log(val)),
    //     filter(() => false)
    //   );
    // }),
    timeout(120000),
    retryWhen(error => {
      let scalingDuration = 5000;
      return error.pipe(
        mergeMap(error => {
          if (subscription !== null) {
            subscription.unsubscribe(function(error, success) {
              if (success) {
                console.log("**** newBlock$ Successfully UNSUBSCRIBED! ****");
              }
              if (error) {
                console.log("**** newBlock$ UNSUBSCRIBE error ****");
                console.log(error);
              }
            });
          }
          console.log(`****  newBlock$ error: ${error.message} ****`);
          retryAttemptNewBlock$++;
          console.log(`**** newBlock$ Attempt ${retryAttemptNewBlock$} ****`);
          // let provider = new Web3.providers.WebsocketProvider(transport);
          console.log("creating new web3 provider end of epic");
          // web3 = new Web3(provider);
          return timer(scalingDuration);
        }),
        finalize(() => console.log("newBlock$ We are done!"))
      );
    })
  );
};
