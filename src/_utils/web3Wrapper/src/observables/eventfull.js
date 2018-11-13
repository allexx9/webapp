import dragoeventfulAbi from "../abis/dragoEventful-v2.json";
import vaulteventfulAbi from "../abis/vaultEventful-v2.json";
import parityregisterAbi from "../abis/parityRegister.json";
import { Observable, timer } from "rxjs";
import { mergeMap, retryWhen, finalize } from "rxjs/operators";
import * as CONST_ from "../utils/const";

export default (web3, networkId) => {
  const DRAGOEVENTFUL = "dragoeventful-v2";
  const VAULTEVENTFUL = "vaulteventful-v2";
  return Observable.create(observer => {
    try {
      const registryContract = new web3.eth.Contract(
        parityregisterAbi,
        CONST_.PARITY_REGISTRY_ADDRESSES[networkId]
      );
      Promise.all([
        registryContract.methods
          .getAddress(web3.utils.sha3(DRAGOEVENTFUL), "A")
          .call(),
        registryContract.methods
          .getAddress(web3.utils.sha3(VAULTEVENTFUL), "A")
          .call()
      ])
        .then(results => {
          let dragoEventAddress = results[0];
          let vaultEventAddress = results[1];
          console.log(dragoEventAddress, vaultEventAddress);
          const dragoeventfulContract = new web3.eth.Contract(
            dragoeventfulAbi,
            dragoEventAddress
          );
          const vaulteventfulContract = new web3.eth.Contract(
            vaulteventfulAbi,
            vaultEventAddress
          );
          dragoeventfulContract.events
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

          vaulteventfulContract.events
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
        })
        .catch(error => {
          console.log("Promise error: " + error);
          observer.error(error);
        });
    } catch (error) {
      console.log(`Catch ${error}`);
      return observer.error(error);
    }
    return () => {
      console.log(`Observable exit`);
    };
  }).pipe(
    retryWhen(error => {
      let scalingDuration = 2000;
      return error.pipe(
        mergeMap((error, i) => {
          console.log(error.message);
          const retryAttempt = i + 1;
          console.log(`eventfull$ Attempt ${retryAttempt}`);
          return timer(scalingDuration);
        }),
        finalize(() => console.log("We are done!"))
      );
    })
  );
};
