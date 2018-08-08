// Redux actions
// Interface
export const ATTACH_INTERFACE = 'ATTACH_INTERFACE'
export const UPDATE_INTERFACE = 'UPDATE_INTERFACE'
export const ATTACH_INTERFACE_PENDING = 'ATTACH_INTERFACE_PENDING'
export const ATTACH_INTERFACE_FULFILLED = 'ATTACH_INTERFACE_FULFILLED'
export const ATTACH_INTERFACE_REJECTED = 'ATTACH_INTERFACE_REJECTED'

// User
export const IS_MANAGER = 'IS_MANAGER'

// Transactions
export const ADD_TRANSACTION = 'ADD_TRANSACTION'
export const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'

// Eventful
export const UPDATE_TRANSACTIONS_DRAGO_HOLDER = 'UPDATE_TRANSACTIONS_DRAGO_HOLDER'
export const UPDATE_TRANSACTIONS_DRAGO_MANAGER = 'UPDATE_TRANSACTIONS_DRAGO_MANAGER'
export const UPDATE_TRANSACTIONS_VAULT_HOLDER = 'UPDATE_TRANSACTIONS_VAULT_HOLDER'
export const UPDATE_TRANSACTIONS_VAULT_MANAGER = 'UPDATE_TRANSACTIONS_VAULT_MANAGER'
export const UPDATE_SELECTED_DRAGO_DETAILS = 'UPDATE_SELECTED_DRAGO_DETAILS'
export const UPDATE_SELECTED_VAULT_DETAILS = 'UPDATE_SELECTED_VAULT_DETAILS'

// Notification
export const INIT_NOTIFICATION = 'INIT_NOTIFICATION'
export const ADD_ERROR_NOTIFICATION = 'ADD_ERROR_NOTIFICATION'


// EXCHANGE



// Relays
export const UPDATE_AVAILABLE_RELAYS = 'UPDATE_AVAILABLE_RELAYS'

// User oders
export const FETCH_FUND_ORDERS = 'FETCH_FUND_ORDERS'
export const UPDATE_FUND_ORDERS = 'UPDATE_FUND_ORDERS'

// Market
export const UPDATE_MARKET_DATA = 'UPDATE_MARKET_DATA'
export const FETCH_CANDLES_DATA = 'FETCH_CANDLES_DATA'
export const FETCH_HISTORY_TRANSACTION_LOGS = 'FETCH_HISTORY_TRANSACTION_LOGS'
export const UPDATE_HISTORY_TRANSACTION_LOGS = 'UPDATE_HISTORY_TRANSACTION_LOGS'
export const FETCH_ASSETS_PRICE_DATA = 'FETCH_ASSETS_PRICE_DATA'
export const UPDATE_SELECTED_RELAY = 'UPDATE_SELECTED_RELAY'
export const ADD_DATAPOINT_MARKET_DATA = 'ADD_DATAPOINT_MARKET_DATA'
export const INIT_MARKET_DATA = 'INIT_MARKET_DATA'


// UI Elements
export const UPDATE_ELEMENT_LOADING = 'UPDATE_ELEMENT_LOADING'

// Account
export const SET_MAKER_ADDRESS = 'SET_MAKER_ADDRESS'

// Order selection
export const UPDATE_SELECTED_FUND = 'UPDATE_SELECTED_FUND'
export const UPDATE_SELECTED_ORDER = 'UPDATE_SELECTED_ORDER'
export const ORDER_UPDATE_FROM_RELAY = 'ORDER_UPDATE_FROM_RELAY'
export const UPDATE_TRADE_TOKENS_PAIR = 'UPDATE_TRADE_TOKENS_PAIR'
export const CANCEL_SELECTED_ORDER = 'CANCEL_SELECTED_ORDER'

// Orderbook
export const ORDERBOOK_UPDATE = 'ORDERBOOK_UPDATE'
export const ORDERBOOK_INIT = 'ORDERBOOK_INIT'
export const SET_ORDERBOOK_AGGREGATE_ORDERS = 'SET_ORDERBOOK_AGGREGATE_ORDERS'

// Websocket
export const RELAY_OPEN_WEBSOCKET = 'RELAY_OPEN_WEBSOCKET'
export const RELAY_MSG_FROM_WEBSOCKET = 'RELAY_MSG_FROM_WEBSOCKET'
export const RELAY_CLOSE_WEBSOCKET = 'RELAY_CLOSE_WEBSOCKET'
export const RELAY_GET_ORDERS = 'RELAY_GET_ORDERS'
export const RELAY_UPDATE_ORDERS = 'RELAY_UPDATE_ORDERS'

// Tokens
export const SET_TOKEN_ALLOWANCE = 'SET_TOKEN_ALLOWANCE'
export const GET_PRICES_BITFINEXE = 'GET_PRICES_BITFINEX'
export const TOKEN_PRICE_TICKERS_FETCH_START = "TOKEN_PRICE_TICKERS_FETCH_START"
export const TOKENS_TICKERS_UPDATE = "TOKENS_TICKERS_UPDATE"
export const TOKEN_PRICE_TICKERS_FETCH_STOP = "TOKEN_PRICE_TICKERS_FETCH_STOP"
export const UPDATE_FUND_LIQUIDITY = "UPDATE_FUND_LIQUIDITY"
export const UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS = "UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS"
export const UPDATE_CURRENT_TOKEN_PRICE = 'UPDATE_CURRENT_TOKEN_PRICE'

export const CUSTOM_EXCHANGE_ACTIONS = [
  RELAY_OPEN_WEBSOCKET,
  FETCH_CANDLES_DATA,
]