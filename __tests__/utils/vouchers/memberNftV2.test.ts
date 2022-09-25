import formatNftVoucher from '../../../src/utils/vouchers/memberNftV2';

describe('formatNftVoucher function', () => {
  test('Returns correctly formatted NFT mint voucher', () => {
    const chainId = 123;
    const contractName = 'mockName';
    const contractAddress = '0xmockAddress';
    const tokenId = 10;
    const tierId = 5;
    const minter = '0xuser';

    expect(formatNftVoucher(chainId, contractName, contractAddress, tokenId, tierId, minter)).toStrictEqual(
      JSON.stringify({
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
      }),
    );
  });
});
