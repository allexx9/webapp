export const app = {
  isConnected: false,
  isSyncing: false,
  syncStatus: {},
  error: {},
  appLoading: true,
  retryTimeInterval: 0,
  connectionRetries: 0,
  lastBlockNumberUpdate: 0,
  accountsAddressHash: '',
  errorEventfulSubscription: false,
  config: {
    isMock: false
  },
  transactionsDrawerOpen: false
}
