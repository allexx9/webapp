import * as ERCdEX from './ercdex'
import * as EthfinexEpics from './ethfinex_epics'
import { createOrderEthfinexV0Epic } from './orders_epics'
import { getCandlesSingleDataEpic } from './ethfinex_epics/getCandlesSingleData_epic'
import { monitorExchangeEventsEpic } from './ethfinex_epics/exchangeEvents_epic'

let Ethfinex = {
  ...EthfinexEpics,
  monitorExchangeEventsEpic,
  createOrderEthfinexV0Epic,
  getCandlesSingleDataEpic
}

export { Ethfinex, ERCdEX }
