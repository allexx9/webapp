const dragoList = () => {
  let list = []
  let i = 1
  list.push({ symbol: 'DR1', name: 'Drago 1', supply: i++ })
  list.push({ symbol: 'DR2', name: 'Drago 2', supply: i++ })
  list.push({ symbol: 'DR3', name: 'Drago 3', supply: i++ })
  list.push({ symbol: 'DR4', name: 'Drago 4', supply: i++ })
  list.push({ symbol: 'DR5', name: 'Drago 5', supply: i++ })
  return list
}

const vaultList = () => {
  let list = []
  let i = 1
  list.push({ symbol: 'VA1', name: 'Vault 1', supply: i++ })
  // list.push({ symbol: 'VA2', name: 'Vault 2', supply: i++ })
  // list.push({ symbol: 'VA3', name: 'Vault 3', supply: i++ })
  // list.push({ symbol: 'VA4', name: 'Vault 4', supply: i++ })
  // list.push({ symbol: 'VA5', name: 'Vault 5', supply: i++ })
  return list
}

export const poolsList = {
  dragos: dragoList(),
  vaults: vaultList()
}
