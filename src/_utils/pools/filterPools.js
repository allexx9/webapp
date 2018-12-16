export const filterPools = (poolsList, filter) => {
  const list = Object.values(poolsList.list)
  list.sort(function(a, b) {
    if (a.details.symbol < b.details.symbol) return -1
    if (a.details.symbol > b.details.symbol) return 1
    return 0
  })
  const filterValue = filter.trim().toLowerCase()
  const filterLength = filterValue.length
  return filterLength === 0
    ? list.filter(item => item.details.poolType === 'drago')
    : list.filter(
        item =>
          (item.details.name.toLowerCase().slice(0, filterLength) ===
            filterValue ||
            item.details.symbol.toLowerCase().slice(0, filterLength) ===
              filterValue) &&
          item.details.poolType === 'drago'
      )
}
