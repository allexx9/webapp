import { DRG_ISIN } from './const';
import { toHex, formatCoins, formatEth } from '../format';
import {APP, DS} from './const.js'
import * as abis from '../contracts';
import BigNumber from 'bignumber.js'
import DragoApi from '../DragoApi/src'

// Getting events signatures
const dragoFactoryEventsSignatures = (contract) => {
  const events = contract._events.reduce((events, event) => {
    events[event._name] = {
      hexSignature: toHex(event._signature)
    }
    return events
  }, {})
  return events
}

export {dragoFactoryEventsSignatures};

class dragoAPI {

  getDragoSupply = (dragoAddress, api, callBack, options) => {
    const instance = api.newContract(abis.drago, dragoAddress).instance
    var sourceLogClass = this.constructor.name
    return instance.totalSupply
      .call({},[])
    }

  deployDrago = (name, symbol, from, api, values) => {
      const options = {
        from: from
      };
      return api.parity
      .registryAddress()
      .then((registryAddress) => {
        const registry = api.newContract(abis.registry, registryAddress).instance;
        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('dragofactory'), 'A']),
          ])
      })
      .then(([address]) =>{
        const instance = api.newContract(abis.dragofactory, address).instance
        instance.createDrago
        .estimateGas(options, values)
        .then((gasEstimate) => {
          options.gas = gasEstimate.mul(1.2).toFixed(0);
          return instance.createDrago.postTransaction(options, values)
        })
        .catch((error) => {
          console.error('error', error)
        })
      })
      .catch((error) => {
        console.error('error', error)
      })
    }
  }
  

var dragoApi = new dragoAPI();
export {dragoApi} 

class utilities {


    getDragoSupply = (dragoAddress, api, callBack, options) => {
      const instance = api.newContract(abis.drago, dragoAddress).instance
      var sourceLogClass = this.constructor.name
      return instance.totalSupply
        .call({},[])
    }
    /**
     * Get the event logs from a the Drago registry
     * @param  {object} api - The Parity Api
     * @param  {sting} dragoAddress - The drago contract address
     * @param  {array} accounts - The ethereum accounts to filter
     * @param  {object} options - Set the information to return
     * @returns {promise} Promise object represents returning array of balances and transactions
     *
     * 
      * This function returns an array of arrays: balances, list of transacions and supply.
      * The parameter options set the arrays to be populated
      * The functions always returns all the arrays. Setting the options will 
      * make the function to return an empty array
      * 
      * This function can be a performance hit, so it will need to be optimized as much as possible.
      **/
    getTransactionsDrago = (api, dragoAddress, accounts, options = {balance: true, supply: false}) => {
      const sourceLogClass = this.constructor.name
      var resultsAll = null
      const dragoApi = new DragoApi(api)
      var ethvalue = 0
      var drgvalue = 0
      const logToEvent = (log) => {
        const key = api.util.sha3(JSON.stringify(log))
        const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log   
        if (typeof params.amount !== 'undefined') {
          ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value,null,api) : formatEth(params.revenue.value,null,api);
          drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value,null,api) : formatCoins(params.revenue.value,null,api);
        }
        return {
          type: log.event,
          state: type,
          blockNumber,
          logIndex,
          transactionHash,
          transactionIndex,
          params,
          key,
          ethvalue,
          drgvalue
        }
      }
      
      // Getting all buyDrago and selDrago events since block 0.
      // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
      // to be passed to getAllLogs. Events are indexed and filtered by topics
      // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

      // The second param of the topics array is the drago address
      // The third param of the topics array is the from address
      // The third param of the topics array is the to address
      //
      //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

      // const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
      var hexAccounts = null
      
      var balances = null
      // Formatting accounts address
      if (accounts !== null) {
        hexAccounts = accounts.map((account) => {
          const hexAccount = '0x' + account.address.substr(2).padStart(64,'0')
          return hexAccount
        })
      }

      // Initializing the eventful contract
      return dragoApi.contract.eventful.init()
        .then (() => {
          // Filter for create events
          const eventsFilterCreate = {
            topics: [ 
              [dragoApi.contract.eventful.hexSignature.DragoCreated], 
              null, 
              null,
              hexAccounts
            ]
          }
          // Filter for buy events
          const eventsFilterBuy = {
            topics: [ 
              [dragoApi.contract.eventful.hexSignature.BuyDrago], 
              null, 
              hexAccounts,
              null
            ]
          }
          // Filter for sell events
          const eventsFilterSell = {
            topics: [ 
              [dragoApi.contract.eventful.hexSignature.SellDrago], 
              null, 
              null,
              hexAccounts
            ]
          }
          const createDragoEvents = dragoApi.contract.eventful
          .getAllLogs(eventsFilterCreate)
          .then((dragoTransactionsLog) => {
            const buyLogs = dragoTransactionsLog.map(logToEvent)
            return buyLogs
          }
          )
          const buyDragoEvents = dragoApi.contract.eventful
            .getAllLogs(eventsFilterBuy)
            .then((dragoTransactionsLog) => {
              const buyLogs = dragoTransactionsLog.map(logToEvent)
              return buyLogs
            }
            )
          const sellDragoEvents = dragoApi.contract.eventful
            .getAllLogs(eventsFilterSell)
            .then((dragoTransactionsLog) => {
              const sellLogs = dragoTransactionsLog.map(logToEvent)
              return sellLogs
            }
            )
          return Promise.all([buyDragoEvents, sellDragoEvents, createDragoEvents])
          .then ((results) =>{
            // Creating an array of promises that will be executed to add timestamp and symbol to each entry
            // Doing so because for each entry we need to make an async call to the client
            // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
            var dragoTransactionsLog = [...results[0], ...results[1], ...results[2]]
            dragoTransactionsLog.filter(function(val) { return val !== null; })
            var dragoBalances = [] 
            var supply = [] 
            const promisesTimestamp = dragoTransactionsLog.map((log, index) => {
              return api.eth
              .getBlockByNumber(log.blockNumber.c[0])
              .then((block) => {
                log.timestamp = block.timestamp
                return log
              })
              .catch((error) =>{
                // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
                // other issues in the app.
                log.timestamp = new Date()
                return log
              })
            })
            // This is an inefficient way to get the symbol for each transactions. 
            // In the future the symbol will have to be saved in the eventful logs.
            const promisesSymbol = dragoTransactionsLog.map((log) => {
              return dragoApi.contract.dragoregistry.init()
                .then(() =>{
                  return dragoApi.contract.dragoregistry.fromAddress(log.params.drago.value)
                  .then((dragoDetails) => {
                    const symbol = dragoDetails[2]
                    const dragoID = dragoDetails[3].c[0]
                    const name = dragoDetails[1]
                    var amount = () => {
                      switch(log.type ) {
                        case 'BuyDrago':
                            return new BigNumber(log.params.revenue.value)
                            break;
                        case 'SellDrago':
                            return new BigNumber(-log.params.amount.value)
                            break;
                        default:
                            return new BigNumber(0)
                      } 
                    }
                    if (options.balance) {
                      if (typeof dragoBalances[dragoID] !== 'undefined') {
                        var balance = dragoBalances[dragoID].balance.add(amount())
                      } else {
                        var balance = amount()
                      }
                      dragoBalances[dragoID] = {
                        balance: balance,
                        name,
                        symbol,
                        dragoID,
                      }
                    }
                    log.symbol = symbol  
                    return log
                  })
                  .then ((log) => {
                    if (log.type === 'DragoCreated' && options.supply) {
                      // return Promise.all([
                      //   this.getDragoSupply(log.params.drago.value, api),
                      // ])
                      dragoApi.contract.drago.init(log.params.drago.value)
                      return dragoApi.contract.drago.totalSupply()
                      .then((dragoSupply) => {
                        // console.log(`${sourceLogClass} ->  dragoDetails Symbol: ${dragoDetails[0][2]}`)
                        const symbol = log.params.symbol.value
                        const name = log.params.name.value
                        const dragoID = log.params.dragoID.value.c[0]
                        supply.push({
                          supply: formatCoins(new BigNumber (dragoSupply),4,api),
                          name: name,
                          symbol: symbol,
                          dragoID: dragoID
                        })
                        log.symbol = symbol
                        return log
                      })
                    }
                    return log
                  })
                })
            })

            // Running all promises
            return Promise.all(promisesTimestamp)
            .then ((results)=>{
              return Promise.all(promisesSymbol)
              .then((results) => {
                var balances = [];
                console.log(`${sourceLogClass} -> Transactions list loaded`);
                // Reorganizing the balances array
                for(var v in dragoBalances) {
                  var balance = {
                    symbol: dragoBalances[v].symbol,
                    name: dragoBalances[v].name,
                    dragoID: dragoBalances[v].dragoID,
                    balance: formatCoins(dragoBalances[v].balance,4,api)
                  }
                  balances.push(balance)
                }
                results = [balances, results, supply]
                return results
              })
            })
          })
          .then ((results)=>{
            return results
          })
        })
    }
  

    shallowEqual(objA: mixed, objB: mixed): boolean {
      const  sourceLogClass = this.constructor.name
      if (objA === objB) {
        // console.log(`${sourceLogClass} -> objA === objB`)
        return true;
      }
    
      if (typeof objA !== 'object' || objA === null ||
          typeof objB !== 'object' || objB === null) {
        // console.log(`${sourceLogClass} -> objA !== 'object'`)
        return false;
      }
    
      var keysA = Object.keys(objA);
      var keysB = Object.keys(objB);
    
      if (keysA.length !== keysB.length) {
        // console.log(`${sourceLogClass} -> keysA.length`);
        return false;
      }
    
      // Test for A's keys different from B.
      var bHasOwnProperty = hasOwnProperty.bind(objB);
      for (var i = 0; i < keysA.length; i++) {
        if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
          // console.log(`${sourceLogClass} -> Test for A's keys different from B`)
          return false;
        }
      }
      return true;
    }
  
    pathExplode (path) {
      var explodedPath = path.pathname.split( '/' );
      return explodedPath
    }

    rootPath (location) {
      var path = location.split( '/' );
      // path.splice(-1,1);
      // var url = path.join('/');
      return DS+APP+DS+path[2]
      }
  
    pathLast (path) {
      return path.pathname.split( '/' ).pop();
    }
  
    dragoISIN(symbol, dragoID) {
      return DRG_ISIN+dragoID.toString().padStart(7, "0")+symbol;
    }
  }
  
    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    // 
    // if (process.env.NODE_ENV !== 'production') {
    //   logger.add(new winston.transports.Console({
    //     format: winston.format.simple()
    //   }));
    // }
    var utils = new utilities();
    export default utils;

/**
 * Generate random data for use in examples.
 */
export function generateRandomList() {
  const list = [];

  for (var i = 0; i < 50000; i++) {
    const random = loremIpsum[i % loremIpsum.length];
    const randoms = [random];

    for (let j = Math.round(Math.random() * 10); j--; ) {
      randoms.push(loremIpsum[(i * j) % loremIpsum.length]);
    }

    list.push({
      color: BADGE_COLORS[i % BADGE_COLORS.length],
      index: i,
      name: NAMES[i % NAMES.length],
      random,
      randomLong: randoms.join(' '),
      size: ROW_HEIGHTS[Math.floor(Math.random() * ROW_HEIGHTS.length)],
    });
  }

  return list;
}

const BADGE_COLORS = [
  '#f44336',
  '#3f51b5',
  '#4caf50',
  '#ff9800',
  '#2196f3',
  '#374046',
  '#cddc39',
  '#2196f3',
  '#9c27b0',
  '#ffc107',
  '#009688',
  '#673ab7',
  '#ffeb3b',
  '#cddc39',
  '#795548',
];
const NAMES = [
  'Peter Brimer',
  'Tera Gaona',
  'Kandy Liston',
  'Lonna Wrede',
  'Kristie Yard',
  'Raul Host',
  'Yukiko Binger',
  'Velvet Natera',
  'Donette Ponton',
  'Loraine Grim',
  'Shyla Mable',
  'Marhta Sing',
  'Alene Munden',
  'Holley Pagel',
  'Randell Tolman',
  'Wilfred Juneau',
  'Naida Madson',
  'Marine Amison',
  'Glinda Palazzo',
  'Lupe Island',
  'Cordelia Trotta',
  'Samara Berrier',
  'Era Stepp',
  'Malka Spradlin',
  'Edward Haner',
  'Clemencia Feather',
  'Loretta Rasnake',
  'Dana Hasbrouck',
  'Sanda Nery',
  'Soo Reiling',
  'Apolonia Volk',
  'Liliana Cacho',
  'Angel Couchman',
  'Yvonne Adam',
  'Jonas Curci',
  'Tran Cesar',
  'Buddy Panos',
  'Rosita Ells',
  'Rosalind Tavares',
  'Renae Keehn',
  'Deandrea Bester',
  'Kelvin Lemmon',
  'Guadalupe Mccullar',
  'Zelma Mayers',
  'Laurel Stcyr',
  'Edyth Everette',
  'Marylin Shevlin',
  'Hsiu Blackwelder',
  'Mark Ferguson',
  'Winford Noggle',
  'Shizuko Gilchrist',
  'Roslyn Cress',
  'Nilsa Lesniak',
  'Agustin Grant',
  'Earlie Jester',
  'Libby Daigle',
  'Shanna Maloy',
  'Brendan Wilken',
  'Windy Knittel',
  'Alice Curren',
  'Eden Lumsden',
  'Klara Morfin',
  'Sherryl Noack',
  'Gala Munsey',
  'Stephani Frew',
  'Twana Anthony',
  'Mauro Matlock',
  'Claudie Meisner',
  'Adrienne Petrarca',
  'Pearlene Shurtleff',
  'Rachelle Piro',
  'Louis Cocco',
  'Susann Mcsweeney',
  'Mandi Kempker',
  'Ola Moller',
  'Leif Mcgahan',
  'Tisha Wurster',
  'Hector Pinkett',
  'Benita Jemison',
  'Kaley Findley',
  'Jim Torkelson',
  'Freda Okafor',
  'Rafaela Markert',
  'Stasia Carwile',
  'Evia Kahler',
  'Rocky Almon',
  'Sonja Beals',
  'Dee Fomby',
  'Damon Eatman',
  'Alma Grieve',
  'Linsey Bollig',
  'Stefan Cloninger',
  'Giovanna Blind',
  'Myrtis Remy',
  'Marguerita Dostal',
  'Junior Baranowski',
  'Allene Seto',
  'Margery Caves',
  'Nelly Moudy',
  'Felix Sailer',
];
const ROW_HEIGHTS = [50, 75, 100];

const loremIpsum = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Phasellus vulputate odio commodo tortor sodales, et vehicula ipsum viverra.',
  'In et mollis velit, accumsan volutpat libero.',
  'Nulla rutrum tellus ipsum, eget fermentum sem dictum quis.',
  'Suspendisse eget vehicula elit.',
  'Proin ut lacus lacus.',
  'Aliquam erat volutpat.',
  'Vivamus ac suscipit est, et elementum lectus.',
  'Cras tincidunt nisi in urna molestie varius.',
  'Integer in magna eu nibh imperdiet tristique.',
  'Curabitur eu pellentesque nisl.',
  'Etiam non consequat est.',
  'Duis mi massa, feugiat nec molestie sit amet, suscipit et metus.',
  'Curabitur ac enim dictum arcu varius fermentum vel sodales dui.',
  'Ut tristique augue at congue molestie.',
  'Integer semper sem lorem, scelerisque suscipit lacus consequat nec.',
  'Etiam euismod efficitur magna nec dignissim.',
  'Morbi vel neque lectus.',
  'Etiam ac accumsan elit, et pharetra ex.',
  'Suspendisse vitae gravida mauris.',
  'Pellentesque sed laoreet erat.',
  'Nam aliquet purus quis massa eleifend, et efficitur felis aliquam.',
  'Fusce faucibus diam erat, sed consectetur urna auctor at.',
  'Praesent et nulla velit.',
  'Cras eget enim nec odio feugiat tristique eu quis ante.',
  'Morbi blandit diam vitae odio sollicitudin finibus.',
  'Integer ac ante fermentum, placerat orci vel, fermentum lacus.',
  'Maecenas est elit, semper ut posuere et, congue ut orci.',
  'Phasellus eget enim vitae nunc luctus sodales a eu erat.',
  'Curabitur dapibus nisi sed nisi dictum, in imperdiet urna posuere.',
  'Vivamus commodo odio metus, tincidunt facilisis augue dictum quis.',
  'Curabitur sagittis a lectus ac sodales.',
  'Nam eget eros purus.',
  'Nam scelerisque et ante in porta.',
  'Proin vitae augue tristique, malesuada nisl ut, fermentum nisl.',
  'Nulla bibendum quam id velit blandit dictum.',
  'Cras tempus ac dolor ut convallis.',
  'Sed vel ipsum est.',
  'Nulla ut leo vestibulum, ultricies sapien ac, pellentesque dolor.',
  'Etiam ultricies maximus tempus.',
  'Donec dignissim mi ac libero feugiat, vitae lacinia odio viverra.',
  'Curabitur condimentum tellus sit amet neque posuere, condimentum tempus purus eleifend.',
  'Donec tempus, augue id hendrerit pretium, mauris leo congue nulla, ac iaculis erat nunc in dolor.',
  'Praesent vel lectus venenatis, elementum mauris vitae, ullamcorper nulla.',
  'Maecenas non diam cursus, imperdiet massa eget, pellentesque ex.',
  'Vestibulum luctus risus vel augue auctor blandit.',
  'Nullam augue diam, pulvinar sed sapien et, hendrerit venenatis risus.',
  'Quisque sollicitudin nulla nec tellus feugiat hendrerit.',
  'Vestibulum a eros accumsan, lacinia eros non, pretium diam.',
  'Aenean iaculis augue sit amet scelerisque aliquam.',
  'Donec ornare felis et dui hendrerit, eget bibendum nibh interdum.',
  'Maecenas tellus magna, tristique vitae orci vel, auctor tincidunt nisi.',
  'Fusce non libero quis velit porttitor maximus at eget enim.',
  'Sed in aliquet tellus.',
  'Etiam a tortor erat.',
  'Donec nec diam vel tellus egestas lobortis.',
  'Vivamus dictum erat nulla, sit amet accumsan dolor scelerisque eu.',
  'In nec eleifend ex, pellentesque dapibus sapien.',
  'Duis a mollis nisi.',
  'Sed ornare nisl sit amet dolor pellentesque, eu fermentum leo interdum.',
  'Sed eget mauris condimentum, molestie justo eu, feugiat felis.',
  'Nunc suscipit leo non dui blandit, ac malesuada ex consequat.',
  'Morbi varius placerat congue.',
  'Praesent id velit in nunc elementum aliquet.',
  'Sed luctus justo vitae nibh bibendum blandit.',
  'Sed et sapien turpis.',
  'Nulla ac eros vestibulum, mollis ante eu, rutrum nulla.',
  'Sed cursus magna ut vehicula rutrum.',
  'Ut consectetur feugiat consectetur.',
  'Nulla nec ligula posuere neque sollicitudin rutrum a a dui.',
  'Nulla ut quam odio.',
  'Integer dignissim sapien et orci sodales volutpat.',
  'Nullam a sapien leo.',
  'Praesent cursus semper purus, vitae gravida risus dapibus mattis.',
  'Sed pellentesque nulla lorem, in commodo arcu feugiat sed.',
  'Phasellus blandit arcu non diam varius ornare.',
];


