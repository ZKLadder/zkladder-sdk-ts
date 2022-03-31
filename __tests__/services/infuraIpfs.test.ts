/**
 * JSDOM does not polyfill certain module dependencies like TextEncoder
 * @jest-environment node
 */

import axios from 'axios';
import Ipfs from '../../src/services/infuraIpfs';

const cidTool = require('cid-tool');

const mockFormDataAppend = jest.fn();

jest.mock('axios', () => ({
  request: jest.fn(),
}));

jest.mock('form-data', () => (jest.fn(() => ({
  append: mockFormDataAppend,
}))));

jest.mock('cid-tool', () => ({
  base32: jest.fn(),
}));

const mockAxios = axios as jest.Mocked<any>;
const mockCidTool = cidTool as jest.Mocked<any>;

const mockDag = {
  data: '0x123',
  links: [
    { Name: 'test.png', Hash: 'Qm12345678', size: 101 },
  ],
};

describe('IPFS client', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('Constructor correctly sets authString property', () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    expect(client.authString).toEqual('Basic cHJvamVjdGlkOnByb2plY3RzZWNyZXQ=');
  });

  test('Request function calls axios correctly', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;

    mockAxios.request.mockResolvedValueOnce({});

    const options = {
      method: 'get',
      url: '/fake/api/path',
      params: {
        param: '1',
        param2: '2',
      },
      data: 'mockData',
      headers: {
        header: '1',
      },
    };

    await client.request(options);

    expect(mockAxios.request).toHaveBeenCalledWith({
      method: options.method,
      url: options.url,
      params: options.params,
      data: options.data,
      headers: {
        ...options.headers,
        Accept: '*/*',
        Authorization: 'Basic cHJvamVjdGlkOnByb2plY3RzZWNyZXQ=',
      },
      baseURL: 'https://ipfs.infura.io:5001',
    });
  });

  test('Request function returns correctly formatted results', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    mockAxios.request.mockResolvedValueOnce({ data: 'mockData' });
    const options = {
      params: {},
      headers: {},
    };

    const response = await client.request(options);

    expect(response).toStrictEqual('mockData');
  });

  test('Request function throws correctly formatted error', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    mockAxios.request.mockRejectedValueOnce({
      config: {
        method: 'get',
        baseURL: 'error.com',
        url: '/a/fake/path',
      },
      message: 'Error getting data',
    });
    const options = {
      params: {},
      headers: {},
    };

    await expect(client.request(options)).rejects.toEqual(new Error('Error getting data, Method:[get], URL:[error.com/a/fake/path]'));
  });

  test('parseResponseString returns correctly formatted objects', () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const responseString = '{"Name":"name1", "Hash":"hash1", "Size":"1"}\n{"Name":"name2", "Hash":"hash2", "Size":"2"}\n{"Name":"name3", "Hash":"hash3", "Size":"3"}\n';

    const responseObject = client.parseResponseString(responseString);

    expect(responseObject).toStrictEqual([
      {
        Name: 'name1',
        Hash: 'hash1',
        Size: 1,
      },
      {
        Name: 'name2',
        Hash: 'hash2',
        Size: 2,
      },
      {
        Name: 'name3',
        Hash: 'hash3',
        Size: 3,
      },
    ]);
  });

  test('GetDag calls the request function with the correct parameters', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => ({}));

    await client.getDag('Qm123456789');

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/v0/dag/get',
      params: {
        arg: 'Qm123456789',
      },
    });
  });

  test('GetDag returns the response from IPFS', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    jest.spyOn(client, 'request').mockImplementation(() => ({ mock: 'response' }));

    const response = await client.getDag('Qm123456789');

    expect(response).toStrictEqual({ mock: 'response' });
  });

  test('GetDag rethrows api errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    const error = { message: 'error' };

    mockRequest.mockRejectedValueOnce(error);

    await expect(client.getDag('Qm123456789')).rejects.toEqual(error);
  });

  test('PutDag calls dependencies with the correct parameters', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockBlob = jest.fn();

    global.Blob = mockBlob;
    mockBlob.mockReturnValueOnce({ test: 'test' });

    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    await client.putDag(mockDag);

    expect(mockBlob).toHaveBeenCalledWith(
      [JSON.stringify(mockDag)],
      { type: 'application/json' },
    );

    expect(mockFormDataAppend).toHaveBeenCalledWith('document', { test: 'test' });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: '/api/v0/dag/put',
        params: {
          pin: true,
          format: 'dag-pb',
        },
      }),
    );
  });

  test('PutDag returns correct api response', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockBlob = jest.fn();

    global.Blob = mockBlob;
    mockBlob.mockReturnValueOnce({ test: 'test' });

    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    mockRequest.mockResolvedValue({ data: 'result' });
    const response = await client.putDag(mockDag);

    expect(response).toStrictEqual({ data: 'result' });
  });

  test('PutDag throws an error when given an invalid dag', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockBlob = jest.fn();

    global.Blob = mockBlob;
    mockBlob.mockReturnValueOnce({ test: 'test' });

    await expect(client.putDag({})).rejects.toStrictEqual(new Error('Argument is not a valid Dag object'));
  });

  test('PutDag rethrows api errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockBlob = jest.fn();

    global.Blob = mockBlob;
    mockBlob.mockReturnValueOnce({ test: 'test' });

    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    mockRequest.mockRejectedValueOnce({ error: 'error' });

    await expect(client.putDag(mockDag)).rejects.toStrictEqual({ error: 'error' });
  });

  test('DetectIpfsUri correctly handles inputs', () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    expect(client.detectIpfsUri('qm12345')).toEqual('qm12345');
    expect(client.detectIpfsUri('ipfs://qm12345')).toEqual('qm12345');
  });

  test('GetGatewayUrl returns correctly formatted reponse', () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    mockDetectIpfsUrl.mockReturnValue('qm12345');

    expect(client.getGatewayUrl('qm12345')).toEqual('https://qm12345.ipfs.infura-ipfs.io');
    expect(mockDetectIpfsUrl).toHaveBeenCalledWith('qm12345');
  });

  test('GetPinned correctly calls the request function', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => ({}));

    await client.getPinned();
    await client.getPinned('Qm123456789');

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/v0/pin/ls',
      params: {},
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/v0/pin/ls',
      params: {
        arg: 'Qm123456789',
      },
    });
  });

  test('GetPinned returns the response from IPFS', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    jest.spyOn(client, 'request').mockImplementation(() => ({ mock: 'response' }));

    const response = await client.getPinned('Qm123456789');

    expect(response).toStrictEqual({ mock: 'response' });
  });

  test('GetPinned rethrows api errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    const error = { message: 'error' };

    mockRequest.mockRejectedValueOnce(error);

    await expect(client.getPinned('Qm123456789')).rejects.toEqual(error);
  });

  test('ShowDirectory correctly calls dependencies', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));
    const mockGetGatewayUrl = jest.spyOn(client, 'getGatewayUrl').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockResolvedValueOnce({ links: [{ Name: 'name', Size: '123', Hash: 'qm54321' }] });

    await client.showDirectory('qm12345');

    expect(mockDetectIpfsUrl).toHaveBeenCalledWith('qm12345');
    expect(mockGetDag).toHaveBeenCalledWith('qm12345');
    expect(mockGetGatewayUrl).toHaveBeenCalledTimes(1);
    expect(mockGetGatewayUrl).toHaveBeenCalledWith('qm12345');
  });

  test('ShowDirectory returns correctly formatted response', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));
    const mockGetGatewayUrl = jest.spyOn(client, 'getGatewayUrl').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockResolvedValueOnce({ links: [{ Name: 'name', Size: '123', Cid: { '/': 'qm54321' } }] });
    mockGetGatewayUrl.mockReturnValueOnce('qm12345.ipfs.infura-ipfs.io');

    const response = await client.showDirectory('qm12345');

    expect(response).toStrictEqual([
      {
        Name: 'name', Size: 123, Hash: 'qm54321', gatewayUrl: 'qm12345.ipfs.infura-ipfs.io/name',
      },
    ]);
  });

  test('ShowDirectory throws when getDag does not return a directory', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockResolvedValueOnce({});

    await expect(client.showDirectory('qm12345')).rejects.toStrictEqual(new Error('Given CID is not an IPFS directory'));
  });

  test('ShowDirectory correctly rethrows errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockRejectedValueOnce({ error: 'error' });

    await expect(client.showDirectory('qm12345')).rejects.toStrictEqual({ error: 'error' });
  });

  test('CreateEmptyDirectory correctly calls dependencies', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockAddFiles = jest.spyOn(client, 'addFiles').mockImplementation(() => (jest.fn()));

    await client.createEmptyDirectory();

    expect(mockAddFiles).toHaveBeenCalledWith([]);
  });

  test('CreateEmptyDirectory returns correctly formatted response', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockAddFiles = jest.spyOn(client, 'addFiles').mockImplementation(() => (jest.fn()));

    mockAddFiles.mockResolvedValue({ hash: 'qm12345' });

    const response = await client.createEmptyDirectory();

    expect(response).toStrictEqual({ hash: 'qm12345' });
  });

  test('CreateEmptyDirectory correctly rethrows errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockAddFiles = jest.spyOn(client, 'addFiles').mockImplementation(() => (jest.fn()));

    mockAddFiles.mockRejectedValue({ error: 'errors' });

    await expect(client.createEmptyDirectory()).rejects.toStrictEqual({ error: 'errors' });
  });

  test('AddFiles correctly calls dependencies', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));
    const mockParseResponseString = jest.spyOn(client, 'parseResponseString').mockImplementation(() => (jest.fn()));
    mockRequest.mockResolvedValue('mockData');
    const mockFiles = [
      { file: { test: '123' }, fileName: 'file1' },
      { file: { test: '456' }, fileName: 'file2' },
      { file: { test: '789' }, fileName: 'file3' },
    ];

    const onuploadprogress = jest.fn();

    await client.addFiles(mockFiles, onuploadprogress);

    expect(mockFormDataAppend).toHaveBeenCalledTimes(3);
    expect(mockFormDataAppend).toHaveBeenCalledWith('file1', { test: '123' }, 'file1');
    expect(mockFormDataAppend).toHaveBeenCalledWith('file2', { test: '456' }, 'file2');
    expect(mockFormDataAppend).toHaveBeenCalledWith('file3', { test: '789' }, 'file3');
    expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
      method: 'post',
      url: '/api/v0/add',
      onUploadProgress: onuploadprogress,
      params: {
        'wrap-with-directory': true,
        'cid-version': 1,
      },
    }));
    expect(mockParseResponseString).toHaveBeenCalledWith('mockData');
  });

  test('AddFiles returns correctly formatted response', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));
    const mockParseResponseString = jest.spyOn(client, 'parseResponseString').mockImplementation(() => (jest.fn()));
    mockRequest.mockResolvedValueOnce('mockData');
    mockParseResponseString.mockReturnValueOnce('mockData');
    const mockFiles = [
      { file: { test: '123' }, fileName: 'file1' },
      { file: { test: '456' }, fileName: 'file2' },
      { file: { test: '789' }, fileName: 'file3' },
    ];

    const onuploadprogress = jest.fn();

    const response = await client.addFiles(mockFiles, onuploadprogress);

    expect(response).toStrictEqual('mockData');
  });

  test('AddFiles correctly rethrows errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));
    mockRequest.mockRejectedValueOnce({ error: 'mockError' });

    const mockFiles = [
      { file: { test: '123' }, fileName: 'file1' },
      { file: { test: '456' }, fileName: 'file2' },
      { file: { test: '789' }, fileName: 'file3' },
    ];

    const onuploadprogress = jest.fn();

    await expect(client.addFiles(mockFiles, onuploadprogress)).rejects.toStrictEqual({ error: 'mockError' });
  });

  test('RemoveFile correctly calls dependencies', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');

    await client.removeFile('qm12345');

    expect(mockDetectIpfsUrl).toHaveBeenCalledWith('qm12345');
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/v0/pin/rm',
      params: {
        arg: 'qm12345',
      },
    });
  });

  test('RemoveFile returns correctly formatted response', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockRequest.mockResolvedValue({ data: 'mockData' });

    const response = await client.removeFile('qm12345');

    expect(response).toStrictEqual({ data: 'mockData' });
  });

  test('RemoveFile correctly rethrows errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockRequest = jest.spyOn(client, 'request').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockRequest.mockRejectedValueOnce({ error: 'error' });

    await expect(client.removeFile('qm12345')).rejects.toStrictEqual({ error: 'error' });
  });

  test('AddFilesToDirectory correctly calls dependencies', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockAddFiles = jest.spyOn(client, 'addFiles').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));
    const mockPutDag = jest.spyOn(client, 'putDag').mockImplementation(() => (jest.fn()));
    const mockRemoveFile = jest.spyOn(client, 'removeFile').mockImplementation(() => (jest.fn()));

    const mockDirectory = { data: '0x123', links: [] };
    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockResolvedValueOnce(mockDirectory);
    mockAddFiles.mockResolvedValueOnce([]);

    const files = [
      { file: { test: '123' }, fileName: 'file1' },
    ];

    await client.addFilesToDirectory(files, 'qm12345');

    expect(mockDetectIpfsUrl).toHaveBeenCalledWith('qm12345');
    expect(mockAddFiles).toHaveBeenCalledWith(files, undefined);
    expect(mockGetDag).toHaveBeenCalledWith('qm12345');
    expect(mockPutDag).toHaveBeenCalledWith(mockDirectory);
    expect(mockRemoveFile).toHaveBeenCalledTimes(2);
  });

  test('AddFilesToDirectory returns correctly formatted response', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockAddFiles = jest.spyOn(client, 'addFiles').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));
    jest.spyOn(client, 'putDag').mockImplementation(() => (jest.fn()));
    jest.spyOn(client, 'removeFile').mockImplementation(() => (jest.fn()));

    const mockDirectory = { data: '0x123', links: [] };
    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockResolvedValueOnce(mockDirectory);
    mockAddFiles.mockResolvedValueOnce([]);
    mockCidTool.base32.mockReturnValueOnce('qm12345');

    const files = [
      { file: { test: '123' }, fileName: 'file1' },
    ];

    const response = await client.addFilesToDirectory(files, 'qm12345');

    expect(response).toStrictEqual({ Hash: 'qm12345' });
  });

  test('AddFilesToDirectory throws when getDag does not return a directory', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockAddFiles = jest.spyOn(client, 'addFiles').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));
    jest.spyOn(client, 'putDag').mockImplementation(() => (jest.fn()));
    jest.spyOn(client, 'removeFile').mockImplementation(() => (jest.fn()));

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockResolvedValueOnce({});
    mockAddFiles.mockResolvedValueOnce([]);
    mockCidTool.base32.mockReturnValueOnce('qm12345');

    const files = [
      { file: { test: '123' }, fileName: 'file1' },
    ];

    await expect(client.addFilesToDirectory(files, 'qm12345')).rejects.toStrictEqual(new Error('Given directoryHash is not an IPFS directory'));
  });

  test('AddFilesToDirectory correctly rethrows errors', async () => {
    const client = new Ipfs('projectid', 'projectsecret') as any;
    const mockDetectIpfsUrl = jest.spyOn(client, 'detectIpfsUri').mockImplementation(() => (jest.fn()));
    const mockAddFiles = jest.spyOn(client, 'addFiles').mockImplementation(() => (jest.fn()));
    const mockGetDag = jest.spyOn(client, 'getDag').mockImplementation(() => (jest.fn()));
    const mockPutDag = jest.spyOn(client, 'putDag').mockImplementation(() => (jest.fn()));
    jest.spyOn(client, 'removeFile').mockImplementation(() => (jest.fn()));

    const mockDirectory = { data: '0x123', links: [] };

    mockDetectIpfsUrl.mockReturnValueOnce('qm12345');
    mockGetDag.mockResolvedValueOnce(mockDirectory);
    mockAddFiles.mockResolvedValueOnce([]);
    mockPutDag.mockRejectedValue({ error: 'error' });

    const files = [
      { file: { test: '123' }, fileName: 'file1' },
    ];

    await expect(client.addFilesToDirectory(files, 'qm12345')).rejects.toStrictEqual({ error: 'error' });
  });
});
