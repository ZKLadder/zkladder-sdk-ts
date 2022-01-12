/* eslint-disable class-methods-use-this */
import { NftWhitelisted, Ipfs } from './interfaces/zklTypes';

import NftWhitelistedClass from './modules/nftWhitelisted';
import IpfsClass from './utils/infuraIpfs/client';

class App {
  private readonly projectId:string;

  private readonly provider:any; // @TODO should be flexible and support multiple provider types

  constructor(projectId:string, provider:any) {
    this.projectId = projectId;
    this.provider = provider;
  }

  public async nftWhitelisted(address:string) {
    const nft = await NftWhitelistedClass.setup(address, this.provider);
    return nft;
  }

  public ipfs(projectId:string, projectSecret:string) {
    return new IpfsClass(projectId, projectSecret);
  }
}

export default App;
export { NftWhitelisted, Ipfs };
