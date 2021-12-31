import NftClass from '../modules/nft';
import IpfsClass from '../utils/infuraIpfs/client';

interface Nft extends NftClass {}
interface Ipfs extends IpfsClass {}

export { Nft, Ipfs };
