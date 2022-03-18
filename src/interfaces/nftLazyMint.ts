import { BigNumber } from 'ethers';

type Role = 'DEFAULT_ADMIN_ROLE' | 'MINTER_ROLE';

interface NftMintVoucher {
  balance:number,
  salePrice:BigNumber,
  minter:string,
  signature:string
}

interface CollectionRole {
  id:string,
  name:string,
  description:string,
  price:number
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
    roles: CollectionRole[],
  }
  infuraIpfs:{
    projectId:string,
    projectSecret:string
  }
}

interface NftConstructorArgs{
  provider:any,
  address:string,
  infuraIpfsProjectId:string,
  infuraIpfsProjectSecret:string
}

export {
  Role, NftMintVoucher, NftDeploymentArgs, NftConstructorArgs, CollectionRole,
};
