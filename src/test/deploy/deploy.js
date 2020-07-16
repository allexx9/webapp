const path = require('path')
const Web3 = require('web3')
const Deployer = require('@rgbk/deployer').Deployer
const { GAS_ESTIMATE } = require('../constants')

const deploy = async (
  from,
  networkUrl,
  contractName,
  args = [],
  verbose = true,
  provider
) => {
  const web3 = provider
    ? new Web3(provider)
    : new Web3(new Web3.providers.HttpProvider(networkUrl))
  const networkId = await web3.eth.net.getId()
  const artifactsDir = path.resolve(
    __dirname,
    '../../../node_modules/@rgbk/contracts/artifacts'
  )
  // console.log(artifactsDir)
  const deployerOpts = {
    artifactsDir: artifactsDir,
    jsonrpcUrl: networkUrl,
    provider,
    verbose,
    networkId,
    defaults: {
      from,
      gas: GAS_ESTIMATE,
      gasPrice: 1
    }
  }
  const deployer = new Deployer(deployerOpts)

  return deployer.deployAndSaveAsync(contractName, args)
}

module.exports = deploy
