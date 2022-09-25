export default (
  chainId:number,
  contractName:string,
  contractAddress:string,
  tokenId:number,
  tierId:number,
  minter:string,
) => JSON.stringify({
  domain: {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  },
  message: {
    tokenId,
    tierId,
    minter,
  },
  types: {
    mintVoucher: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'tierId', type: 'uint32' },
      { name: 'minter', type: 'address' },
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
