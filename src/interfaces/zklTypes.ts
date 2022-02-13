import MemberNftClass from '../services/memberNft';
import IpfsClass from '../modules/infuraIpfs';

interface MemberNft extends MemberNftClass {}
interface Ipfs extends IpfsClass {}

export { MemberNft, Ipfs };
