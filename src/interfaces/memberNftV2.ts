import { Role, NftConstructorArgsFull, NftConstructorArgsReadOnly } from './memberNftV1';

interface NftMintVoucher {
  balance:number,
  tierId:number,
  minter:string,
  signature:string
}

interface NftDeploymentArgs {
  provider:any,
  collectionData:{
    name:string,
    symbol:string,
    beneficiaryAddress: string,
    image?:string,
    description?:string,
    script?:string,
  }
  infuraIpfs:{
    projectId:string,
    projectSecret:string
  }
}

interface Tier {
  name:string,
  royaltyBasis: number,
  salePrice:number,
  isTransferable: boolean
}

interface TierUpdate {
  tierId:number,
  tierUpdates:Tier
}

export {
  NftMintVoucher, NftDeploymentArgs, Role, NftConstructorArgsFull, NftConstructorArgsReadOnly, Tier, TierUpdate,
};
