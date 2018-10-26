const Web3 = require('web3')
const dragoeventfulAbi = require('./dragoEventful-v2.json')
const vaulteventfulAbi = require('./vaultEventful-v2.json')
const parityregisterAbi = require('./parityRegister.json')
const { Observable, from, timer, of } = require('rxjs')
const {
  mergeMap,
  retryWhen,
  finalize,
  timeout,
  map,
  catchError,
  exhaustMap,
  tap
} = require('rxjs/operators')

let Web3Wrapper = (function() {
  // Instance stores a reference to the Singleton

  let instance
  let web3

  const init = async (networkName, protocol) => {
    const endpoints = {
      https: {
        KOVAN: {
          dev: 'https://kovan.infura.io/metamask',
          prod: 'https://kovan.infura.io/metamask'
        },
        ROPSTEN: {
          dev: 'https://ropsten.infura.io/metamask',
          prod: 'https://ropsten.infura.io/metamask'
        },
        MAINNET: {
          dev: 'https://mainnet.infura.io/metamask',
          prod: 'https://mainnet.infura.io/metamask'
        }
      },
      wss: {
        KOVAN: {
          dev: 'wss://kovan.infura.io/ws',
          prod: 'wss://kovan.infura.io/ws'
        },
        ROPSTEN: {
          dev: 'wss://ropsten.infura.io/ws',
          prod: 'wss://ropsten.infura.io/ws'
        },
        MAINNET: {
          dev: 'wss://mainnet.infura.io/ws',
          prod: 'wss://mainnet.infura.io/ws'
        }
      }
    }

    const KOVAN = 'KOVAN'
    const ROPSTEN = 'ROPSTEN'
    const MAINNET = 'MAINNET'

    const PARITY_REGISTRY_ADDRESSES = {
      42: '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3',
      3: '0x81a4B044831C4F12bA601aDB9274516939e9B8a2',
      1: '0xe3389675d0338462dC76C6f9A3e432550c36A142',
      [KOVAN]: '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3',
      [ROPSTEN]: '0x81a4B044831C4F12bA601aDB9274516939e9B8a2',
      [MAINNET]: '0xe3389675d0338462dC76C6f9A3e432550c36A142'
    }

    const DRAGOEVENTFUL = 'dragoeventful-v2'
    const VAULTEVENTFUL = 'vaulteventful-v2'
    networkName = networkName.toUpperCase()
    const transport = endpoints[protocol][networkName].prod
    let provider = new Web3.providers.WebsocketProvider(transport)
    web3 = new Web3(provider)

    const webSocket$ = Observable.create(observer => {
      provider = new Web3.providers.WebsocketProvider(transport)
      web3.setProvider(provider)
      provider.on('connect', function(event) {
        console.log('WSS connected')
        observer.next(event)
      })
      provider.on('open', function(event) {
        console.log('WSS open')
        observer.next(event)
      })
      provider.on('data', function(event) {
        console.log('WSS data')
        observer.next(event)
      })
      provider.on('error', function(event) {
        console.log('WSS error')
        observer.next(event)
      })
      provider.on('end', event => {
        console.log('WS end')
        console.log('Attempting to reconnect...')
        return observer.error(event)
      })

      return () => {
        console.log(`Observable exit`)
      }
    }).pipe(
      retryWhen(error => {
        let scalingDuration = 2000
        return error.pipe(
          mergeMap((error, i) => {
            // console.log(error)
            const retryAttempt = i + 1
            console.log(`webSocket$ Attempt ${retryAttempt}`)
            return timer(scalingDuration)
          }),
          finalize(() => console.log('We are done!'))
        )
      })
    )

    webSocket$.subscribe(() => {})

    let nodeStatus = {
      isConnected: false,
      isSyncing: false,
      syncStatus: {},
      error: {}
    }

    let scalingDuration = 1000
    let timeInterval = 0
    let retryAttempt = 0
    const nodeStatus$ = timer(0, 2000).pipe(
      exhaustMap(() => {
        return from(
          web3.eth.isSyncing().catch(error => {
            throw new Error(
              error.message.charAt(0).toUpperCase() + error.message.slice(1)
            )
          })
        ).pipe(
          timeout(2500),
          tap(result => {
            return result
          }),
          map(result => {
            retryAttempt = 0
            timeInterval = 0
            if (result !== false) {
              if (result.highestBlock.minus(result.currentBlock).gt(2)) {
                nodeStatus.isConnected = true
                nodeStatus.isSyncing = true
                nodeStatus.syncStatus = result
                nodeStatus.error = {}
              } else {
                nodeStatus.isConnected = true
                nodeStatus.isSyncing = false
                nodeStatus.syncStatus = {}
                nodeStatus.error = {}
              }
            } else {
              nodeStatus.isConnected = true
              nodeStatus.isSyncing = false
              nodeStatus.syncStatus = {}
              nodeStatus.error = {}
            }
            return nodeStatus
          }),
          catchError(error => {
            console.log('Error nodeStatus$ -> ' + error.message)
            retryAttempt++
            retryAttempt > 5
              ? (timeInterval = scalingDuration * 5)
              : (timeInterval = scalingDuration * retryAttempt)
            nodeStatus.isConnected = false
            nodeStatus.isSyncing = false
            nodeStatus.syncStatus = {}
            nodeStatus.error = error.message
            nodeStatus.retryTimeInterval = timeInterval
            nodeStatus.connectionRetries = retryAttempt
            return of(nodeStatus)
          })
        )
      })
    )

    const eventfull$ = Observable.create(observer => {
      try {
        const registryContract = new web3.eth.Contract(
          parityregisterAbi,
          PARITY_REGISTRY_ADDRESSES[networkName]
        )
        Promise.all([
          registryContract.methods
            .getAddress(web3.utils.sha3(DRAGOEVENTFUL), 'A')
            .call(),
          registryContract.methods
            .getAddress(web3.utils.sha3(VAULTEVENTFUL), 'A')
            .call()
        ])
          .then(results => {
            let dragoEventAddress = results[0]
            let vaultEventAddress = results[1]
            console.log(dragoEventAddress, vaultEventAddress)
            const dragoeventfulContract = new web3.eth.Contract(
              dragoeventfulAbi,
              dragoEventAddress
            )
            const vaulteventfulContract = new web3.eth.Contract(
              vaulteventfulAbi,
              vaultEventAddress
            )
            dragoeventfulContract.events
              .allEvents(
                {
                  fromBlock: 'latest'
                },
                function(error, event) {
                  if (error !== null) {
                    console.warn(`WS error 1 ${error}`)
                    return observer.error(error)
                  }
                }
              )
              .on('data', function(event) {
                console.log('Event: ' + JSON.stringify(event)) // same results as the optional callback above
                return observer.next(event)
              })
              .on('error', function(error) {
                console.warn(`WS error 2 ${error}`)
                return observer.error(error)
              })

            vaulteventfulContract.events
              .allEvents(
                {
                  fromBlock: 'latest'
                },
                function(error, event) {
                  if (error !== null) {
                    console.warn(`WS error 1 ${error}`)
                    return observer.error(error)
                  }
                }
              )
              .on('data', function(event) {
                console.log('Event: ' + JSON.stringify(event)) // same results as the optional callback above
                return observer.next(event)
              })
              .on('error', function(error) {
                console.warn(`WS error 2 ${error}`)
                return observer.error(error)
              })
          })
          .catch(error => {
            console.log('Promise error: ' + error)
            observer.error(error)
          })
      } catch (error) {
        console.log(`Catch ${error}`)
        return observer.error(error)
      }
      return () => {
        console.log(`Observable exit`)
      }
    }).pipe(
      retryWhen(error => {
        let scalingDuration = 2000
        return error.pipe(
          mergeMap((error, i) => {
            console.log(error.message)
            const retryAttempt = i + 1
            console.log(`eventfull$ Attempt ${retryAttempt}`)
            return timer(scalingDuration)
          }),
          finalize(() => console.log('We are done!'))
        )
      })
    )

    return {
      web3,
      endpoint: transport,
      eventfull$,
      nodeStatus$: nodeStatus$
    }
  }

  return {
    getInstance: async function(
      networkName = 'MAINNET',
      protocol = 'wss',
      options = {}
    ) {
      if (!networkName) {
        throw new Error('networkName needs to be provided')
      }
      if (!instance) {
        instance = await init(networkName, protocol)
      } else {
      }
      return instance
    }
  }
})()

export default Web3Wrapper
