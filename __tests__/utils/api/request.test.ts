import axios from 'axios';
import request from '../../../src/utils/api/request';

jest.mock('axios', () => ({ request: jest.fn() }));

const mockAxios = axios as jest.Mocked<any>;

describe('Generic ZKL API request wrapper', () => {
  test('Calls axios with the correct parameters', async () => {
    mockAxios.request.mockResolvedValueOnce('test');

    await request({
      method: 'get',
      url: 'a/test/url',
    });

    expect(mockAxios.request).toHaveBeenCalledWith({
      method: 'get',
      url: 'a/test/url',
      headers: {
        Accept: '*/*',
      },
      baseURL: 'http://zkladder.us-east-1.elasticbeanstalk.com/api',
    });
  });

  test('Returns response data correctly', async () => {
    mockAxios.request.mockResolvedValueOnce({ data: 'MockData' });

    const response = await request({
      method: 'get',
      url: 'a/test/url',
    });

    expect(response).toStrictEqual('MockData');
  });

  test('Rethrows axios errors correctly', async () => {
    mockAxios.request.mockRejectedValueOnce({
      message: 'Not working',
      config: {
        method: 'get',
        baseURL: 'a/base/url',
        url: 'a/test/url',
      },
    });

    try {
      await request({
        method: 'get',
        url: 'a/test/url',
      });
      expect(true).toBe(false); // should be unreachable
    } catch (error) {
      expect(error).toStrictEqual(new Error('Not working, Method:[get], URL:[a/base/urla/test/url]'));
    }
  });
});
