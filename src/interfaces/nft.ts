/* eslint-disable import/prefer-default-export */

import { EthereumAddress } from './address';

interface NftTokenData {
  tokenId: number;
  tokenUri: string;
  owner: EthereumAddress;
}

export { NftTokenData };
