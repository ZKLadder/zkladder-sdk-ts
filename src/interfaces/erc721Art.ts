import { Role, NftConstructorArgsFull, NftConstructorArgsReadOnly } from './memberNftV1';
import { NftDeploymentArgs } from './memberNftV2';

interface NftMintVoucher {
  tokenId:number,
  minter:string,
  tokenUri:string,
  signature:string
}

interface BatchMintToPayload {
  to:string,
  tokenId:number,
  metadata:{ [key: string]: any }
}

export {
  NftMintVoucher, NftDeploymentArgs, Role, NftConstructorArgsFull, NftConstructorArgsReadOnly, BatchMintToPayload,
};
