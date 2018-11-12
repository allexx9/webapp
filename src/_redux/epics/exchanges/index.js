import * as ERCdEX from './ercdex'
import * as EthfinexEpics from './ethfinex_epics'
import { monitorExchangeEventsEpic } from './ethfinex_epics/exchangeEvents_epics'

let Ethfinex = { ...EthfinexEpics, ...monitorExchangeEventsEpic }
export { Ethfinex, ERCdEX }
