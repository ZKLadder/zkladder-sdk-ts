import getContractABI from '../../../src/utils/api/getContractABI';
import request from '../../../src/utils/api/request';

jest.mock('../../../src/utils/api/request', () => (jest.fn()));

const mockRequest = request as jest.Mocked<any>;

describe('Generic ZKL API request wrapper', () => {
  test('Calls axios with the correct parameters', async () => {
    mockRequest.mockResolvedValueOnce('test');

    await getContractABI({
      id: '3',
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/v1/contracts/3/abi',
    });
  });

  test('Returns response data correctly', async () => {
    mockRequest.mockResolvedValueOnce('MockData');

    const response = await getContractABI({
      id: '3',
    });

    expect(response).toStrictEqual('MockData');
  });

  test('Rethrows axios errors correctly', async () => {
    mockRequest.mockRejectedValueOnce(new Error('Not working, Method:[get], URL:[http://localhost:8081/api/v1/contracts/3/abi]'));

    try {
      await getContractABI({
        id: '3',
      });
      expect(true).toBe(false); // should be unreachable
    } catch (error) {
      expect(error).toStrictEqual(new Error('Not working, Method:[get], URL:[http://localhost:8081/api/v1/contracts/3/abi]'));
    }
  });
});
