const networks = {
  1: {
    name: 'Ethereum',
    currency: 'ETH',
    chainId: 1,
    RPCEndpoint: 'https://mainnet.infura.io/v3/2d33fc4d9a9b4140b8582c1ef3bd12e8',
  },
  3: {
    name: 'Ropsten',
    currency: 'ROP',
    chainId: 3,
    RPCEndpoint: 'https://ropsten.infura.io/v3/2d33fc4d9a9b4140b8582c1ef3bd12e8',
  },
  4: {
    name: 'Rinkeby',
    currency: 'RIN',
    chainId: 4,
    RPCEndpoint: 'https://rinkeby.infura.io/v3/2d33fc4d9a9b4140b8582c1ef3bd12e8',
  },
  5: {
    name: 'Goerli',
    currency: 'GOR',
    chainId: 5,
    RPCEndpoint: 'https://goerli.infura.io/v3/2d33fc4d9a9b4140b8582c1ef3bd12e8',
  },
  137: {
    name: 'Polygon',
    currency: 'MATIC',
    chainId: 137,
    RPCEndpoint: 'https://polygon-mainnet.infura.io/v3/2d33fc4d9a9b4140b8582c1ef3bd12e8',
  },
  100: {
    name: 'Gnosis Chain',
    currency: 'xDai',
    chainId: 100,
    RPCEndpoint: 'https://rpc.gnosischain.com',
  },
  5777: {
    name: 'Ganache',
    currency: 'LOCAL',
    chainId: 5777,
    RPCEndpoint: 'http://localhost:7545',
  },
  31337: {
    name: 'Hardhat',
    currency: 'HAT',
    chainId: 31337,
    RPCEndpoint: 'http://localhost:8545',
  },
};

const getNetworkById = (networkId:keyof typeof networks) => {
  if (!networks[networkId]) throw new Error('Requested unsupported network id');
  return networks[networkId];
};

export default getNetworkById;
