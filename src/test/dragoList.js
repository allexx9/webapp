const dragoList = () => {
  let dragos = []
  let i = 1
  dragos.push({ symbol: 'DR1', name: 'Drago 1', supply: i++ })
  dragos.push({ symbol: 'DR2', name: 'Drago 2', supply: i++ })
  dragos.push({ symbol: 'DR3', name: 'Drago 3', supply: i++ })
  dragos.push({ symbol: 'DR4', name: 'Drago 4', supply: i++ })
  dragos.push({ symbol: 'DR5', name: 'Drago 5', supply: i++ })
  return dragos
}

export const poolsList = {
  dragos: dragoList()
}
