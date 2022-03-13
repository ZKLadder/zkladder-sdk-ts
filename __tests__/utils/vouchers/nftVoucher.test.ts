import { ethToWei } from '../../../src/utils/contract/conversions';
import formatNftVoucher from '../../../src/utils/vouchers/nftVoucher';

jest.mock('../../../src/utils/contract/conversions', () => ({
  ethToWei: jest.fn(),
}));

const mockEthToWei = ethToWei as jest.Mocked<any>;

describe('formatNftVoucher function', () => {
  test('Returns correctly formatted NFT mint voucher', () => {
    const chainId = 123;
    const contractName = 'mockName';
    const contractAddress = '0xmockAddress';
    const balance = 1;
    const salePrice = 123;
    const minter = '0xuser';

    mockEthToWei.mockReturnValue(1234567);
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
          salePrice: 1234567,
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
