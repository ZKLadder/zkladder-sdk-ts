import { MemberNftV1 as MemberNft, MemberNftV1ReadOnly as MemberNftReadOnly } from './services/memberNftV1';
import { MemberNftV2, MemberNftV2ReadOnly } from './services/memberNftV2';
import { ERC721Art, ERC721ArtReadOnly } from './services/erc721Art';
import { ERC20 } from './services/ERC20';
import Ipfs from './services/infuraIpfs';
import AccessValidator from './services/accessValidator';
import {
  ethToWei, weiToEth, gweiToEth, hexToDecimal, parseUnits, formatUnits,
} from './utils/contract/conversions';
import { isEthereumAddress } from './interfaces/address';

const utilities = {
  ethToWei,
  weiToEth,
  gweiToEth,
  hexToDecimal,
  isEthereumAddress,
  parseUnits,
  formatUnits,
};

export {
  MemberNftV2,
  MemberNft,
  ERC721Art,
  ERC20,
  Ipfs,
  AccessValidator,
  utilities,
};

export type { MemberNftV2ReadOnly, MemberNftReadOnly, ERC721ArtReadOnly };
