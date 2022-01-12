type Role = 'DEFAULT_ADMIN_ROLE' | 'MINTER_ROLE';

interface MintVoucher {
  tokenUri:string,
  balance:number,
  minter:string,
  signature:string
}

export { Role, MintVoucher };
