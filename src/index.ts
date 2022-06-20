import { MemberNftV1, MemberNftV1ReadOnly } from './services/memberNftV1';
import { MemberNftV2 as MemberNft, MemberNftV2ReadOnly as MemberNftReadOnly } from './services/memberNftV2';
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
  MemberNftV1,
  MemberNft,
  Ipfs,
  utilities,
};

export type { MemberNftV1ReadOnly, MemberNftReadOnly };
