export const isMetamask = api => {
  if (typeof api.version === 'undefined') {
    return false
  } else {
    return true
  }
}
