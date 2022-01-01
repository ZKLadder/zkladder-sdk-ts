import { AxiosRequestHeaders } from 'axios';

interface HttpOptions{
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  url: string; // path
  params?: object; // querystring parameters
  data?: object; // request body
  headers?: AxiosRequestHeaders; // request headers
  onUploadProgress?(event: ProgressEvent): void
}

interface GetContractABIOptions {
  id: string
}

export { HttpOptions, GetContractABIOptions };
