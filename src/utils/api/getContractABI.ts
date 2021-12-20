import request from './request';
import { GetContractABIOptions } from '../../interfaces/api';

/**
 * Returns contract ABI for specified contract ID
 * @param options.id id of contract to query
 */

export default async (options: GetContractABIOptions) => {
  const { id } = options;
  const response = await request({
    method: 'get',
    url: `/v1/contracts/${id}/abi`,
  });
  return response;
};
