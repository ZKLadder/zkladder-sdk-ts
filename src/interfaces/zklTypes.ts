import NftWhitelistedClass from '../modules/nftWhitelisted';
import IpfsClass from '../utils/infuraIpfs/client';

interface NftWhitelisted extends NftWhitelistedClass {}
interface Ipfs extends IpfsClass {}

export { NftWhitelisted, Ipfs };
