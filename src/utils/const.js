export const APP = "app";
export const DS = "/";
export const DRG_ISIN = "DR";
// Set connetions to production server
export const PROD = false;
// Set connetions to WebSocketSecure or HTTPs
export const WS = false;
// Address of the Parity registry of smart contracts
export const REGISTRY_KOVAN = '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3';
// Address of RigoToken GRG
export const GRG_ADDRESS_KV = "0x7f026C6E42C808bA02A551BDdD753F9927dA06b1";

// Blockchain endpoint
export const EP_INFURA_KV = "https://kovan.infura.io/metamask"
export const EP_INFURA_RP = "https://ropsten.infura.io/metamask"
export const EP_INFURA_MN = "https://mainnet.infura.io/metamask"
export const EP_INFURA_KV_WS = "wss://kovan.infura.io/ws"
export const EP_INFURA_RP_WS = "wss://ropsten.infura.io/ws"
export const EP_INFURA_MN_WS = "wss://mainnet.infura.io/ws"

// Parity on ports 85xx
export const EP_RIGOBLOCK_KV_DEV = "https://srv03.endpoint.network:8545"
export const EP_RIGOBLOCK_KV_DEV_WS = "wss://srv03.endpoint.network:8546"
export const EP_RIGOBLOCK_KV_PROD = "https://kovan.endpoint.network:8545"
export const EP_RIGOBLOCK_KV_PROD_WS = "wss://kovan.endpoint.network:8546"

// Parity on ports 86xx
export const EP_RIGOBLOCK_RP_DEV = "https://srv03.endpoint.network:8645"
export const EP_RIGOBLOCK_RP_DEV_WS = "wss://srv03.endpoint.network:8646"
export const EP_RIGOBLOCK_RP_PROD = "https://ropsten.endpoint.network:8645"
export const EP_RIGOBLOCK_RP_PROD_WS = "wss://ropsten.endpoint.network:8646"

// Parity on ports 87xx
export const EP_RIGOBLOCK_MN_DEV = "https://srv03.endpoint.network:8745"
export const EP_RIGOBLOCK_MN_DEV_WS = "wss://srv03.endpoint.network:8746"
export const EP_RIGOBLOCK_MN_PROD = "https://mainnet.endpoint.network:8745"
export const EP_RIGOBLOCK_MN_PROD_WS = "wss://mainnet.endpoint.network:8746"

// Allowed endpoints in config section
export const INFURA = 'infura'
export const RIGOBLOCK = 'rigoblock'
export const LOCAL = 'local'
export const CUSTOM = 'custom'
export const ALLOWED_ENDPOINTS = [
  ['infura', false],
  ['rigoblock', false],
  ['local', false],
  ['custom', false],
]
export const DEFAULT_ENDPOINT = 'infura';
// Please refert to the following link for network IDs
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
// kovan = 42
export const DEFAULT_NETWORK_NAME = 'kovan';
export const DEFAULT_NETWORK_ID = 42;
export const NETWORK_OK = "networkOk"
export const NETWORK_WARNING = "networkWarning"

export const KOVAN = "kovan"
export const KOVAN_ID = 42
export const ROPSTEN = "ropsten"
export const ROPSTEN_ID = 3
export const MAINNET = "mainnet"
export const MAINNET_ID = 1

// Default messages
export const MSG_NO_SUPPORTED_NETWORK = "We have detected that MetaMask is not connected to Kovan or Ropsten network. Please select Kovan network in your MetaMask."
export const MSG_NETWORK_STATUS_OK = "Service is operating normally."
export const MSG_NETWORK_STATUS_ERROR = "Service disruption. Cannot update accounts balances. Account balances could be out of date."

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

