import { MemberNft, MemberNftReadOnly } from './services/memberNft';
import Ipfs from './services/infuraIpfs';
import {
  ethToWei, weiToEth, gweiToEth, hexToDecimal,
} from './utils/contract/conversions';
import { isEthereumAddress } from './interfaces/address';

const utilities = {
  ethToWei,
  weiToEth,
  gweiToEth,
  hexToDecimal,
  isEthereumAddress,
};

export {
  MemberNft,
  Ipfs,
  utilities,
};

export type { MemberNftReadOnly };
