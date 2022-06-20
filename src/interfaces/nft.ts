/* eslint-disable import/prefer-default-export */

import { EthereumAddress } from './address';

interface NftTokenData {
  tokenId: number;
  tokenUri: string;
  tierId?:number;
  owner: EthereumAddress;
  metadata?: { [key: string]: any };
}

export { NftTokenData };
