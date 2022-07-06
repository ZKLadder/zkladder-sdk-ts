import { MemberNftV1 as MemberNft, MemberNftV1ReadOnly as MemberNftReadOnly } from './services/memberNftV1';
import { MemberNftV2, MemberNftV2ReadOnly } from './services/memberNftV2';
import Ipfs from './services/infuraIpfs';
import AccessValidator from './services/accessValidator';
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
  MemberNftV2,
  MemberNft,
  Ipfs,
  AccessValidator,
  utilities,
};

export type { MemberNftV2ReadOnly, MemberNftReadOnly };
