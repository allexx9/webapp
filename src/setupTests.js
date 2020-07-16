import { GANACHE_NETWORK_ID, GANACHE_PORT, NETWORKS } from './test/constants'
import { seedPools } from './test/seedPools'
import bootstrap from './test/deploy/bootstrap'
import c from 'chalk'
import ganache from 'ganache-cli'
import logger from './test/deploy/logger'
import pkg from '@rgbk/contracts/package.json'
import web3 from './test/web3'

require('jest-extended')

let server
// const snapDir = __dirname + '/test/ganache/bootstrap/'
// const dbDir = __dirname + '/test/ganache/db/'
process.on('warning', e => {
  console.warn(e.stack)
  // process.exit(1)
})
process.on('error', e => {
  console.log('err')
  console.error(e.stack)
  // process.exit(1)
})

const setupGanache = async () => {
  // console.log(global.dragoList)
  // console.log('setupGanache')
  // if (typeof global.dragoList !== 'undefined') {
  //   if (!fs.existsSync(dbDir) || !fs.existsSync(snapDir)) {
  //     process.exit(1)
  //   }
  //   del.sync([dbDir + '/**'])
  //   console.log('files deleted')
  //   fs.copySync(snapDir, dbDir)
  //   console.log('files copied')
  // }

  const ganacheOptions = {
    mnemonic: pkg.config.mnemonic,
    port: GANACHE_PORT,
    network_id: GANACHE_NETWORK_ID,
    default_balance_ether: 1000
    // db_path: dbDir
  }
  server = ganache.server(ganacheOptions)
  server.listen(GANACHE_PORT, err =>
    err ? logger.error(err) : logger.info(c.bold.green('Ganache starting!'))
  )
  const rawAccounts = await web3.eth.getAccounts()

  global.accounts = rawAccounts.map(acc => {
    return { address: acc.toLowerCase() }
  })
  const prevLog = console.log
  console.log = () => {}
  global.baseContracts = await bootstrap(accounts[0].address, NETWORKS.ganache)
  console.log = prevLog
  // if (typeof global.dragoList === 'undefined') {
  //   global.dragoList = await seedPools('Drago', global.baseContracts)
  //   global.vaultList = await seedPools('Vault', global.baseContracts)
  // }
  global.dragoList = await seedPools('Drago', global.baseContracts)
  global.vaultList = await seedPools('Vault', global.baseContracts)
}

global.describeContract = (name, f) => {
  describe('', () => {
    beforeAll(setupGanache, 30000)
    describe(name, f)
    afterAll(async () => {
      const closeGanachePromise = new Promise((resolve, reject) => {
        server.close(err =>
          err
            ? reject(new Error(err))
            : resolve(logger.info(c.bold.yellow('Ganache stopping...')))
        )
      })
      return await closeGanachePromise
    })
  })
}

expect.extend({
  toBeHash(received) {
    try {
      if (received.substring(0, 2) === '0x' && received.length === 66) {
        return {
          message: () => `expected ${received} to be a valid Hash`,
          pass: true
        }
      }
    } catch (err) {}
    return {
      message: () => `expected ${received} to be a valid Hash`,
      pass: false
    }
  }
})
