import exchangeEfxV0Abi from "../abis/exchange-efx-v0.json";
import { Observable, timer } from "rxjs";
import { mergeMap, retryWhen, finalize } from "rxjs/operators";
import * as CONST_ from "../utils/const";

const exchangeEfxV0$ = (web3, networkName) => {
  return Observable.create(observer => {
    let efxEchangeContract;
    try {
      efxEchangeContract = new web3.eth.Contract(
        exchangeEfxV0Abi,
        CONST_.EFX_EXCHANGE_CONTRACT[networkName].toLowerCase()
      );
      // efxEchangeContract
      //   .getPastEvents(
      //     "allEvents",
      //     {
      //       fromBlock: 0,
      //       toBlock: "latest"
      //     },
      //     function(error, events) {
      //       console.log(events);
      //     }
      //   )
      //   .then(function(events) {
      //     console.log(events); // same results as the optional callback above
      //   });
      efxEchangeContract.events
        .allEvents(
          {
            fromBlock: "latest"
          },
          function(error, event) {
            if (error !== null) {
              console.warn(`WS error 1 ${error}`);
              return observer.error(error);
            }
          }
        )
        .on("data", function(event) {
          console.log("Event: " + JSON.stringify(event)); // same results as the optional callback above
          return observer.next(event);
        })
        .on("error", function(error) {
          console.warn(`WS error 2 ${error}`);
          return observer.error(error);
        });
    } catch (error) {
      console.log(`Catch ${error}`);
      return observer.error(error);
    }
    return () => {
      efxEchangeContract.clearSubscriptions();
      console.log(`Observable exit`);
    };
  }).pipe(
    retryWhen(error => {
      let scalingDuration = 2000;
      return error.pipe(
        mergeMap((error, i) => {
          console.log(error.message);
          const retryAttempt = i + 1;
          console.log(`exchangeEfx$ Attempt ${retryAttempt}`);
          return timer(scalingDuration);
        }),
        finalize(() => console.log("We are done!"))
      );
    })
  );
};

export default exchangeEfxV0$;
