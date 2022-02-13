type Role = 'DEFAULT_ADMIN_ROLE' | 'MINTER_ROLE';

interface NftMintVoucher {
  balance:number,
  minter:string,
  signature:string
}

interface NftDeploymentArgs {
  provider:any,
  name:string,
  symbol:string,
  baseUri: string,
  beneficiary: string
}

interface NftConstructorArgs{
  provider:any,
  address:string,
  infuraIpfsProjectId:string,
  infuraIpfsProjectSecret:string
}

export {
  Role, NftMintVoucher, NftDeploymentArgs, NftConstructorArgs,
};
