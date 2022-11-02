import { Role, NftConstructorArgsFull, NftConstructorArgsReadOnly } from './memberNftV1';

interface NftMintVoucher {
  tokenId:number,
  tierId:number,
  minter:string,
  tokenUri:string,
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
    external_link?:string,
    script?:string,
  }
  infuraIpfs:{
    projectId:string,
    projectSecret:string
  }
}

interface Tier {
  tierURI?:string,
  royaltyBasis: number,
  salePrice: number,
  isTransferable: boolean
}

interface TierWithMetadata extends Tier {
  tierId:number,
  name: string,
  description?:string,
  image?: string
}

interface TierUpdate {
  tierId:number,
  tierUpdates:Tier
}

export {
  NftMintVoucher, NftDeploymentArgs, Role, NftConstructorArgsFull, NftConstructorArgsReadOnly, Tier, TierWithMetadata, TierUpdate,
};
