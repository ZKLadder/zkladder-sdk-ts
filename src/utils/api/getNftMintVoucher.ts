import request from './request';
import { GetNftMintVoucherOptions } from '../../interfaces/api';

/**
 * Returns contract ABI for specified contract ID
 * @param options.id id of contract to query
 */

export default async (options: GetNftMintVoucherOptions) => {
  const {
    contractAddress, userAddress, chainId, roleId,
  } = options;
  const response = await request({
    method: 'get',
    url: '/v1/vouchers',
    params: {
      contractAddress,
      userAddress,
      chainId,
      roleId,
    },
  });
  return response;
};
