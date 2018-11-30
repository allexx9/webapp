export const notificationWrapper = (function() {
  let instance

  return {
    getInstance: function(notificatioInstance) {
      if (!instance) {
        if (notificatioInstance) {
          // throw new Error('An instance must be provided.')
        }
        instance = notificatioInstance
      }
      return instance
    }
  }
})()
