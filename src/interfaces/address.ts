const { utils } = require('ethers');

type EthereumAddress = string & {
  readonly EthereumAddress: unique symbol
};

const isEthereumAddress = (address:string): EthereumAddress => {
  if (!utils.isAddress(address)) throw new Error('Not a valid Eth address');
  return address as EthereumAddress;
};

export { EthereumAddress, isEthereumAddress };
