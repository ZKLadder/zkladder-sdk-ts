import { MemberNft as MemberNftClass, MemberNftReadOnly as MemberNftReadOnlyClass } from '../services/memberNft';
import IpfsClass from '../services/infuraIpfs';

interface MemberNft extends MemberNftClass {}
interface MemberNftReadOnly extends MemberNftReadOnlyClass {}
interface Ipfs extends IpfsClass {}

export { MemberNft, MemberNftReadOnly, Ipfs };
