type AccessSchemaKey = 'hasBalance' | 'hasBalanceERC20' | 'hasERC721' | 'hasERC1155' | 'isWhitelisted' | 'isBlacklisted' | 'timelock';

interface AccessConditionsOptions {
  key:AccessSchemaKey,
  chainId:number,
  contractAddress?:string,
  minBalance?: number,
  decimals?: number,
  tokenId?:number,
  whitelistedAddress?:string,
  blacklistedAddress?:string,
  timestamp?:number,
  comparator?:string
}

type AccessOperator = 'and' | 'or';

export type { AccessConditionsOptions, AccessOperator };
