import axios from 'axios';
import { HttpOptions } from '../../interfaces/api';

/**
 * Generalized request wrapper used by other ZKL API functions
 * For a full list of endpoints:
 * @TODO add API doc URL here
 * @param options input object holding function parameters
 */
export default async (options: HttpOptions) => {
  try {
    const response = await axios.request({
      ...options,
      headers: {
        ...options.headers,
        Accept: '*/*',
      },
      baseURL: process.env.ZKL_API || 'http://zkladder.us-east-1.elasticbeanstalk.com/api',
    });
    return response.data;
  } catch (error: any) {
    const method = error.config?.method;
    const baseUrl = error.config?.baseURL;
    const path = error.config?.url;
    throw new Error(`${error.message}, Method:[${method}], URL:[${baseUrl}${path}]`);
  }
};
