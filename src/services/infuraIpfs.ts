/* eslint-disable class-methods-use-this */
import axios from 'axios';
import FormData from 'form-data';
import {
  IpfsApiResponse, AddFilesOptions, ProgressEvent, Dag,
} from '../interfaces/ipfs';
import { HttpOptions } from '../interfaces/api';

const cidTool = require('cid-tool');

class InfuraIpfs {
  private readonly authString: string;

  constructor(projectId:string, projectSecret:string) {
    this.authString = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
  }

  // Private Utils
  /**
   * Generic wrapper utility to call the Infura IPFS API
   * @param options
   * @returns API response
   */
  private async request(options: HttpOptions) {
    try {
      const response = await axios.request({
        ...options,
        headers: {
          ...options.headers,
          Accept: '*/*',
          Authorization: this.authString,
        },
        baseURL: 'https://ipfs.infura.io:5001',
      });
      return response.data;
    } catch (error: any) {
      const method = error.config?.method;
      const baseUrl = error.config?.baseURL;
      const path = error.config?.url;
      throw new Error(`${error.message}, Method:[${method}], URL:[${baseUrl}${path}]`);
    }
  }

  /**
   * Formats the response from POST api/v0/add into a valid Javascript object
   * @param response
   * @returns JS Object representation of response string
   */
  private parseResponseString(response:string) {
    const responseObjects = response.split('\n');
    return responseObjects
      .filter(
        (string) => (string.length > 0),
      ).map(
        (string) => {
          const fileObject = JSON.parse(string);
          return {
            ...fileObject,
            Size: parseInt(fileObject.Size, 10),
          };
        },
      );
  }

  /**
   * Returns a DAG node from IPFS by CID
   * @param arg CID of DAG to return
   * @returns Dag object
   */
  private async getDag(arg:string): Promise<Dag> {
    const object = await this.request({
      method: 'post',
      url: '/api/v0/dag/get',
      params: {
        arg,
      },
    });

    return object;
  }

  /**
   * Adds a DAG node to IPFS
   * @param dag valid DAG JS object
   * @returns CID of newly added DAG
   */
  private async putDag(dag:any) {
    if (!dag.data || !dag.links) throw new Error('Argument is not a valid Dag object');

    const newObject = new Blob(
      [JSON.stringify(dag)],
      {
        type: 'application/json',
      },
    );

    const data = new FormData();
    data.append('document', newObject);

    const response = await this.request({
      method: 'post',
      url: '/api/v0/dag/put',
      data,
      params: {
        pin: true,
        format: 'dag-pb',
      },
    });

    return response;
  }

  /**
   * Detects and transforms IPFS URI input into valid CID
   * @example
   * ```
   * // returns QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq
   * detectIpfsUri('ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq')
   * ```
   * @param arg IPFS Uri or valid CID
   * @returns Valid CID
   */
  private detectIpfsUri(arg:string): string {
    if (arg.startsWith('ipfs')) return arg.split('//')[1];
    return arg;
  }

  // Public Utils
  /**
   * Returns the CID or IPFS URI wrapped in an HTTP friendly infura gateway URL
   * @example
   * ```
   * // returns bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.infura-ipfs.io
   * getGatewayUrl('ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq')
   * ```
   * @param arg IPFS URI or valid CID
   * @returns HTTP friendly Infura gatway uri
   */
  public getGatewayUrl(arg:string): string {
    const cid = this.detectIpfsUri(arg);
    if (cid.length === 46 && cid.startsWith('Qm')) return `https://${cidTool.base32(cid)}.zkladder.infura-ipfs.io`;
    return `https://${cid}.zkladder.infura-ipfs.io`;
  }

  /**
   * Get all pinned files and directories
   * @param arg optional path
   * @returns all currently pinned files and directories
   */
  public async getPinned(arg?:string) {
    const response = await this.request({
      method: 'post',
      url: '/api/v0/pin/ls',
      params: {
        arg,
      },
    });
    return response;
  }

  // Service Functions
  /**
   * Return all entries inside of valid IPFS directory
   * @param arg Directory CID
   * @returns Array of file CID's referenced inside of directory
   */
  public async showDirectory(arg:string): Promise<IpfsApiResponse[]> {
    const cid = this.detectIpfsUri(arg);
    const directory = await this.getDag(cid);
    if (!directory.links) throw new Error('Given CID is not an IPFS directory');
    const files = directory.links.map((file:any) => ({
      Name: file.Name as string,
      Size: parseInt(file.Size, 10),
      Hash: file.Cid?.['/'] as string,
      gatewayUrl: `${this.getGatewayUrl(cid)}/${file.Name}`,
    }));

    return files;
  }

  /**
   * Creates ands pins empty IPFS directory
   * @returns Empty directory CID
   */
  public async createEmptyDirectory() {
    const response = await this.addFiles([]);
    return response;
  }

  /**
   * Add and pin files to IPFS
   * @param files Array of files
   * @param onUploadProgress Optional callback which fires with progress updates for large uploads
   * @returns Add IPFS CID's
   */
  public async addFiles(files: AddFilesOptions[], onUploadProgress?: (event:ProgressEvent)=>void): Promise<IpfsApiResponse[]> {
    const formData = new FormData();
    files.forEach(({ file, fileName }) => {
      formData.append(fileName, file, fileName);
    });

    const response = await this.request({
      method: 'post',
      url: '/api/v0/add',
      data: formData,
      onUploadProgress,
      params: {
        'wrap-with-directory': true,
        'cid-version': 1,
      },
    });

    // Infura IPFS API returns multiple file records as a single string requiring extra processing
    return this.parseResponseString(response as any);
  }

  /**
   * Unpin a file from Infura IPFS
   * @param arg CID of file or directory to unpin
   * @returns CID of unpinned directory
   */
  public async removeFile(arg:string) {
    const cid = this.detectIpfsUri(arg);
    const response = await this.request({
      method: 'post',
      url: '/api/v0/pin/rm',
      params: {
        arg: cid,
      },
    });
    return response;
  }

  /**
   * Add files to an existing directory
   * @param files Files to add
   * @param directoryArg Existing directory CID
   * @param onUploadProgress Optional callback which fires with progress updates for large uploads
   * @returns Updated CID of the new directory
   */
  public async addFilesToDirectory(
    files:AddFilesOptions[],
    directoryArg:string,
    onUploadProgress?: (event:ProgressEvent)=>void,
  ) : Promise<{ Hash:string }> {
    const directoryCid = this.detectIpfsUri(directoryArg);

    const newFileData = await this.addFiles(files, onUploadProgress);

    const directoryData = await this.getDag(directoryCid);

    if (!directoryData.links) throw new Error('Given directoryHash is not an IPFS directory');

    let newFileDirectory: string = '';

    newFileData.forEach((newFile) => {
      if (newFile.Name.length > 0) {
        directoryData.links.push({
          Name: newFile.Name,
          Size: newFile.Size,
          Cid: { '/': newFile.Hash },
        });
      } else {
        newFileDirectory = newFile.Hash;
      }
    });

    const response = await this.putDag(directoryData);

    await Promise.allSettled([
      this.removeFile(newFileDirectory),
      this.removeFile(directoryCid),
    ]);

    return { Hash: cidTool.base32(response?.Cid?.['/']) };
  }
}

export default InfuraIpfs;
