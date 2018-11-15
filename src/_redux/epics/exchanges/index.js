import * as ERCdEX from './ercdex'
import * as EthfinexEpics from './ethfinex_epics'
import { createOrderEthfinexV0Epic } from './orders_epics'
import { monitorExchangeEventsEpic } from './ethfinex_epics/exchangeEvents_epics'

let Ethfinex = {
  ...EthfinexEpics,
  monitorExchangeEventsEpic,
  createOrderEthfinexV0Epic
}

export { Ethfinex, ERCdEX }
