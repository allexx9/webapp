import ExchangeConnector from '@rigoblock/exchange-connector'

let ExchangeConnectorWrapper = (function() {
  let instance

  return {
    getInstance: function() {
      if (!instance) {
        instance = new ExchangeConnector()
      }
      return instance
    },
    getNewInstance: function() {
      return new ExchangeConnector()
    }
  }
})()

export default ExchangeConnectorWrapper
