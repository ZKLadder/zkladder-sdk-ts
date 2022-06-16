import { BigNumber } from 'ethers';
import formatNftVoucher from '../../../src/utils/vouchers/memberNftV1';

describe('formatNftVoucher function', () => {
  test('Returns correctly formatted NFT mint voucher', () => {
    const chainId = 123;
    const contractName = 'mockName';
    const contractAddress = '0xmockAddress';
    const balance = 10;
    const salePrice = BigNumber.from(123);
    const minter = '0xuser';

    expect(formatNftVoucher(chainId, contractName, contractAddress, balance, salePrice, minter)).toStrictEqual(
      JSON.stringify({
        domain: {
          chainId,
          name: contractName,
          verifyingContract: contractAddress,
          version: '1',
        },
        message: {
          balance,
          salePrice: '123',
          minter,
        },
        types: {
          mintVoucher: [
            { name: 'balance', type: 'uint256' },
            { name: 'salePrice', type: 'uint256' },
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
