import getNftMintVoucher from '../../../src/utils/api/getNftMintVoucher';
import request from '../../../src/utils/api/request';

jest.mock('../../../src/utils/api/request', () => (jest.fn()));

const mockRequest = request as jest.Mocked<any>;

describe('getNftMintVoucher request wrapper', () => {
  test('Calls axios with the correct parameters', async () => {
    mockRequest.mockResolvedValueOnce('test');

    await getNftMintVoucher({
      contractAddress: '0xcontract',
      userAddress: '0xuser',
      chainId: 1,
      roleId: 'mockRole',
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/v1/vouchers',
      params: {
        contractAddress: '0xcontract',
        userAddress: '0xuser',
        chainId: 1,
        roleId: 'mockRole',
      },
    });
  });

  test('Returns response data correctly', async () => {
    mockRequest.mockResolvedValueOnce('MockData');

    const response = await getNftMintVoucher({
      contractAddress: '0xcontract',
      userAddress: '0xuser',
      chainId: 1,
      roleId: 'mockRole',
    });

    expect(response).toStrictEqual('MockData');
  });

  test('Rethrows axios errors correctly', async () => {
    mockRequest.mockRejectedValueOnce(new Error('Not working, Method:[get], URL:[http://localhost:8081/api/v1/contracts/3/abi]'));

    try {
      await getNftMintVoucher({
        contractAddress: '0xcontract',
        userAddress: '0xuser',
        chainId: 1,
        roleId: 'mockRole',
      });
      expect(true).toBe(false); // should be unreachable
    } catch (error) {
      expect(error).toStrictEqual(new Error('Not working, Method:[get], URL:[http://localhost:8081/api/v1/contracts/3/abi]'));
    }
  });
});
