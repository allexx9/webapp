import { Observable, timer } from "rxjs";
import { timeout, mergeMap, retryWhen, finalize } from "rxjs/operators";

export default web3 => {
  let subscription = null;
  let retryAttemptNewBlock$ = 0;
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
      console.log(`**** newBlock$ exit ****`);
    };
  }).pipe(
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
          return timer(scalingDuration);
        }),
        finalize(() => console.log("We are done!"))
      );
    })
  );
};
