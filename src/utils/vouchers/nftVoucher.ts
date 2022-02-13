export default (
  chainId:number,
  contractName:string,
  contractAddress:string,
  balance:number,
  minter:string,
) => JSON.stringify({
  domain: {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  },
  message: {
    balance,
    minter,
  },
  types: {
    mintVoucher: [
      { name: 'balance', type: 'uint256' },
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
