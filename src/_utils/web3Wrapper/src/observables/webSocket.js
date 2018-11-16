import Web3 from "web3";
import { Observable, timer, interval, from } from "rxjs";
import {
  mergeMap,
  retryWhen,
  finalize,
  timeout,
  tap,
  throttle,
  exhaustMap,
  delay,
  map
} from "rxjs/operators";

let retryAttemptWebSocket = 0;

const webSocket$ = (web3, newWeb3, transport, provider) => {
  // let provider = new Web3.providers.WebsocketProvider(transport, {
  //   timeout: 30000
  // });

  return timer(0, 2000).pipe(
    exhaustMap(() => {
      retryAttemptWebSocket = 0;
      return from(web3.eth.net.isListening());
    }),
    // tap(val => console.log(val)),
    map(status => {
      // web3.connStatus = status;
      return status;
    }),
    timeout(10000),
    retryWhen(errors => {
      console.log("INSIDE RETRYWHEN");
      return errors.pipe(
        tap(error => {
          console.log("Websocket disconnected. Setting new provider.");
        }),
        map(error => {
          // console.log(error);
          retryAttemptWebSocket++;
          console.log(`**** webSocket$ Attempt ${retryAttemptWebSocket} ****`);
          web3.setProvider(new Web3.providers.WebsocketProvider(transport));
        }),
        delay(5000)
      );
    })
  );

  // return Observable.create(observer => {
  //   provider.on("connect", function(event) {
  //     retryAttemptWebSocket = 0;
  //     console.log("**** WSS connected ****");
  //     const status = { event, error: false };
  //     observer.next(status);
  //   });
  //   provider.on("open", function(event) {
  //     console.log("**** WSS open ****");
  //     observer.next(event);
  //   });
  //   provider.on("data", function(event) {
  //     console.log("**** WSS data ****");
  //     const status = { event, error: false };
  //     observer.next(status);
  //   });
  //   provider.on("error", function(event) {
  //     console.log("**** WSS error ****");
  //     console.log("**** Attempting to reconnect error... **** ");
  //     const status = { event, error: true };
  //     observer.error(status);
  //   });
  //   provider.on("end", event => {
  //     console.log("**** WS end ****");
  //     console.log("**** Attempting to reconnect end... ****");
  //     const status = { event, error: true };
  //     observer.error(status);
  //   });

  //   return () => {
  //     console.log(`**** webSocket$ exit ****`);
  //   };
  // }).pipe(
  //   tap(val => {
  //     return val;
  //   }),
  //   timeout(120000),
  //   retryWhen(error => {
  //     let scalingDuration = 10000;
  //     return error.pipe(
  //       throttle(val => interval(2000)),
  //       mergeMap(error => {
  //         console.log(error);
  //         retryAttemptWebSocket++;
  //         console.log(`**** webSocket$ Attempt ${retryAttemptWebSocket} ****`);
  //         let provider = new Web3.providers.WebsocketProvider(transport, {
  //           timeout: 30000
  //         });
  //         web3.setProvider(provider);
  //         web3 = new Web3(provider);
  //         return timer(scalingDuration);
  //       }),
  //       finalize(() => console.log("We are done!"))
  //     );
  //   })
  // );
};

export default webSocket$;
