export const KOVAN = "KOVAN";
export const ROPSTEN = "ROPSTEN";
export const MAINNET = "MAINNET";

export const PARITY_REGISTRY_ADDRESSES = {
  42: "0xfAb104398BBefbd47752E7702D9fE23047E1Bca3",
  3: "0x81a4B044831C4F12bA601aDB9274516939e9B8a2",
  1: "0xe3389675d0338462dC76C6f9A3e432550c36A142",
  [KOVAN]: "0xfAb104398BBefbd47752E7702D9fE23047E1Bca3",
  [ROPSTEN]: "0x81a4B044831C4F12bA601aDB9274516939e9B8a2",
  [MAINNET]: "0xe3389675d0338462dC76C6f9A3e432550c36A142"
};

export const EFX_EXCHANGE_CONTRACT = {
  3: "0x1D8643aaE25841322ecdE826862A9FA922770981",
  1: "0xdcDb42C9a256690bd153A7B409751ADFC8Dd5851",
  [ROPSTEN]: "0x1D8643aaE25841322ecdE826862A9FA922770981",
  [MAINNET]: "0xdcDb42C9a256690bd153A7B409751ADFC8Dd5851"
};

export const ENDPOINTS = {
  https: {
    3: {
      dev: "https://kovan.infura.io/metamask",
      prod: "https://kovan.infura.io/metamask"
    },
    42: {
      dev: "https://ropsten.infura.io/metamask",
      prod: "https://ropsten.infura.io/metamask"
    },
    1: {
      dev: "https://mainnet.infura.io/metamask",
      prod: "https://mainnet.infura.io/metamask"
    }
  },
  wss: {
    3: {
      dev: "wss://kovan.infura.io/ws",
      prod: "wss://kovan.infura.io/ws"
    },
    42: {
      dev: "wss://ropsten.infura.io/ws",
      prod: "wss://ropsten.infura.io/ws"
    },
    1: {
      dev: "wss://mainnet.infura.io/ws",
      prod: "wss://mainnet.infura.io/ws"
    },
    0: {
      dev: "ws://localhost:8546",
      prod: "ws://localhost:8546"
    }
  }
};
