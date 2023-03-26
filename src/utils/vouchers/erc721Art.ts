export default (
  chainId:number,
  contractName:string,
  contractAddress:string,
  tokenId:number,
  minter:string,
  tokenUri:string,
) => JSON.stringify({
  domain: {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  },
  message: {
    tokenId,
    minter,
    tokenUri,
  },
  types: {
    mintVoucher: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'minter', type: 'address' },
      { name: 'tokenUri', type: 'string' },
    ],
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
  },
  primaryType: 'mintVoucher',
});
