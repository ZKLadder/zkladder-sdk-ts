import Nft from './nft';

export default class App {
  private readonly projectId:string;

  private readonly provider:any; // @TODO should be flexible and support multiple provider types

  constructor(projectId:string, provider:any) {
    this.projectId = projectId;
    this.provider = provider;
  }

  public async nft(address:string) {
    const nft = await Nft.setup(address, this.provider);
    return nft;
  }
}
