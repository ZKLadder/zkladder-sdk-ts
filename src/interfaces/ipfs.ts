type FileContent = string | Blob;

interface IpfsApiResponse {
  Name: string,
  Hash: string,
  Size: number,
  gatewayUrl?:string
}

interface AddFilesOptions {
  file: FileContent,
  fileName: string
}

interface ProgressEvent {
  lengthComputable: boolean,
  loaded: number,
  total: number
}

interface Dag {
  data: string,
  links: { Name:string, Cid:any, Size:number } []
}

export {
  IpfsApiResponse, AddFilesOptions, ProgressEvent, Dag,
};
