export const getFromBlock = networkInfo => {
  if (networkInfo.id === 5777) {
    return '0'
  }
  let fromBlock
  switch (networkInfo.id) {
    case 1:
      fromBlock = '6000000'
      break
    case 42:
      fromBlock = '7000000'
      break
    case 3:
      fromBlock = '3000000'
      break
    default:
      fromBlock = '3000000'
  }
  return fromBlock
}
