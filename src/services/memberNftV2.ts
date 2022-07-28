import {
  providers, Contract, ContractFactory, Signer, ContractInterface, getDefaultProvider, utils,
} from 'ethers';
import axios from 'axios';
import contracts from '@zkladder/zkladder-contracts';
import InfuraIpfs from './infuraIpfs';
import { ERC721MembershipV2ReadOnly, ERC721MembershipV2 } from '../modules/ERC721MembershipV2';
import {
  NftDeploymentArgs, NftMintVoucher, NftConstructorArgsFull, NftConstructorArgsReadOnly, TierWithMetadata,
} from '../interfaces/memberNftV2';
import getNftMintVoucher from '../utils/api/getNftMintVoucher';
import { EthereumAddress, isEthereumAddress } from '../interfaces/address';
import { parseTransactionData } from '../utils/contract/conversions';
import { NftTokenData } from '../interfaces/nft';
import formatNftVoucher from '../utils/vouchers/memberNftV2';
import { validateInitializerParams } from '../utils/contract/validators';
import applyMixins from '../utils/mixins/applyMixins';
import getNetworkById from '../constants/networks';

const constructorGuard = { };

type ReturnType<T> = T extends NftConstructorArgsFull ? MemberNftV2 : MemberNftV2ReadOnly;

class MemberNftV2ReadOnly extends ERC721MembershipV2ReadOnly {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.BaseProvider;

  protected readonly ethersSigner?: Signer;

  protected readonly ipfsModule: InfuraIpfs;

  constructor(guard:any, options: NftConstructorArgsReadOnly) {
    super();

    if (guard !== constructorGuard) throw new Error('Cannot call constructor directly; Use MemberNft.setup function');

    const {
      address, chainId, infuraIpfsProjectId, infuraIpfsProjectSecret,
    } = options;

    this.ipfsModule = new InfuraIpfs(infuraIpfsProjectId, infuraIpfsProjectSecret);
    this.address = isEthereumAddress(address);

    const { RPCEndpoint } = getNetworkById(chainId as any);
    this.ethersProvider = getDefaultProvider(RPCEndpoint);
  }

  public registerAbi(abi:ContractInterface) {
    this.contractAbstraction = new Contract(
      this.address,
      abi,
      this.ethersSigner || this.ethersProvider,
    );
  }

  /**
   * Retrieve collection level metadata fields including collection name, symbol, beneficiaryAddress and roles config
   * @returns Collection level metadata
   */
  public async getCollectionMetadata(): Promise<NftDeploymentArgs['collectionData']> {
    const name = await this.name();
    const symbol = await this.symbol();
    const beneficiaryAddress = await this.beneficiaryAddress();
    const collectionUri = await this.contractUri();
    const metadataUrl = this.ipfsModule.getGatewayUrl(collectionUri);
    const response = await axios.get(metadataUrl);
    const collectionData = response.data;
    return {
      name,
      symbol,
      beneficiaryAddress,
      ...collectionData,
    };
  }

  /**
   * Get membership tier data
   * @param tierId
   * @returns Tier data
   */
  public async getTier(tierId:number): Promise<TierWithMetadata> {
    const tier = await this.tierInfo(tierId);
    const metadataUrl = this.ipfsModule.getGatewayUrl(tier.tierURI);
    // @TODO Potentially refactor to use ipfs /cat
    const response = await axios.get(metadataUrl);
    const metadata = response.data;
    return {
      ...tier, ...metadata,
    };
  }

  /**
   * Get NFT by ID
   * @param tokenId
   * @returns NFT data
   */
  public async getToken(tokenId:number): Promise<NftTokenData> {
    const tokenUri = await this.tokenUri(tokenId);
    const owner = await this.ownerOf(tokenId);
    const tierId = await this.tokenTiers(tokenId);
    const metadataUrl = this.ipfsModule.getGatewayUrl(tokenUri);
    // @TODO Potentially refactor to use ipfs /cat
    const response = await axios.get(metadataUrl);
    const metadata = response.data;
    return {
      tokenId, tokenUri, owner, tierId, metadata,
    };
  }

  /**
   * Enumerate and return all minted NFT's
   * @remarks May experience performance issues when dealing with large sums of tokens
   * @returns Array of NFT data
   */
  public async getAllTokens(): Promise<NftTokenData[]> {
    const total = await this.totalSupply();
    const promises = [];
    for (let tokenIndex = 0; tokenIndex < total; tokenIndex += 1) {
      promises.push(this.getToken(tokenIndex));
    }
    const results = await Promise.all(promises);
    return results;
  }

  /**
   * Enumerate and return all minted NFT's belonging to a specified account
   * @param owner Ethereum account for which to fetch tokens
   * @remarks May experience performance issues when dealing with large sums of tokens
   * @returns Array of NFT data
   */
  public async getAllTokensOwnedBy(owner:string): Promise<NftTokenData[]> {
    isEthereumAddress(owner);
    const allTokens = await this.getAllTokens();
    return allTokens.filter((token) => (token.owner.toLowerCase() === owner.toLowerCase()));
  }
}

interface MemberNftV2 extends MemberNftV2ReadOnly, ERC721MembershipV2 {}

class MemberNftV2 {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.Web3Provider;

  protected readonly ethersSigner: Signer;

  protected readonly contractAbstraction: Contract;

  protected readonly ipfsModule: InfuraIpfs;

  constructor(guard:any, options: NftConstructorArgsFull) {
    if (guard !== constructorGuard) throw new Error('Cannot call constructor directly; Use MemberNft.setup function');

    const {
      address, provider, infuraIpfsProjectId, infuraIpfsProjectSecret,
    } = options;

    this.ipfsModule = new InfuraIpfs(infuraIpfsProjectId, infuraIpfsProjectSecret);
    this.address = isEthereumAddress(address);

    if (Signer.isSigner(provider)) { // ethers Wallet provided
      this.ethersProvider = provider.provider as providers.Web3Provider;
      this.ethersSigner = provider;
    } else { // EIP-1193 compliant object provided
      this.ethersProvider = new providers.Web3Provider(provider);
      this.ethersSigner = this.ethersProvider.getSigner();
    }
  }

  /**
 * Creates a new instance of MemberNft at the specified address.
 * @param options.provider OPTIONAL - Valid ethers Wallet instance or EIP-1193 compliant provider object
 * @param options.chainId OPTIONAL - ID of chain to connect to. Only needed if provider param is not included.
 * @param options.address Address of MemberNft contract to connect to
 * @param options.infuraIpfsProjectId Infura IPFS project ID. ZKL tech team will provide this value
 * @param options.infuraIpfsProjectSecret Infura IPFS project secret. ZKL tech team will provide this value
 * @remarks If given the chainId parameter, a read only instance is returned. If given the provider parameter, a full instance is returned.
 * @returns New instance of MemberNft
 */
  public static async setup<T extends NftConstructorArgsFull | NftConstructorArgsReadOnly>(options:T): Promise<ReturnType<T>> {
    if ('provider' in options) {
      const memberNft = new MemberNftV2(constructorGuard, options as NftConstructorArgsFull);
      const { abi } = contracts('3');
      memberNft.registerAbi(abi);
      return memberNft as ReturnType<T>;
    } if ('chainId' in options) {
      const memberNftReadOnly = new MemberNftV2ReadOnly(constructorGuard, options as NftConstructorArgsReadOnly);
      const { abi } = contracts('3');
      memberNftReadOnly.registerAbi(abi);
      return memberNftReadOnly as ReturnType<T>;
    } throw new Error('Must pass in either valid provider or chainId');
  }

  /**
 * Deploys a new proxy instance of MemberNftV2
 * @remarks This function deploys only an upgradeable proxy and requires that the implementation contract already be deployed
 * @param options.provider Valid ethers Wallet instance or EIP-1193 compliant provider object
 * @param options.collectionData NFT collection metadata fields.
 * @param options.infuraIpfs.projectId Infura IPFS project ID. ZKL tech team will provide this value
 * @param options.infuraIpfs.projectSecret Infura IPFS project secret. ZKL tech team will provide this value
 * @returns Newly deployed smart contract address. Contract is not immediately usable as it still likely being mined when this function returns
 */
  public static async deploy(options: NftDeploymentArgs) {
    const {
      provider, collectionData, infuraIpfs,
    } = options;

    // Object containing abi, bytecode and other contract metadata
    const memberNftContract = contracts('3');

    // Throw an error if the implementation contract has not been deployed
    if (await provider.request({
      method: 'eth_getCode',
      params: [memberNftContract.address, 'latest'],
    }) === '0x') throw new Error('This contract is not yet available on this blockchain network');

    const { name, symbol, beneficiaryAddress } = collectionData;

    const ipfsMetadata:any = {
      ...collectionData,
    };

    // Remove fields stored on-chain from ipfsFile
    delete ipfsMetadata.name;
    delete ipfsMetadata.symbol;
    delete ipfsMetadata.beneficiaryAddress;

    // Publish collection metadata blob to IPFS
    const { projectId, projectSecret } = infuraIpfs;
    const ipfsModule = new InfuraIpfs(projectId, projectSecret);
    const file = new Blob([JSON.stringify(ipfsMetadata)], { type: 'application/json' });
    const response = await ipfsModule.addFiles([{ file, fileName: `${symbol}.json` }]);
    const contractUri = `ipfs://${response[0].Hash}`;

    // Validate initializer inputs
    validateInitializerParams(memberNftContract.abi, [name, symbol, contractUri, beneficiaryAddress]);

    // Encode proxy contract initializer with constructor params
    const initializeAbi = [memberNftContract.initializer];
    const iface = new utils.Interface(initializeAbi);
    const abiEncoded = iface.encodeFunctionData('initialize', [name, symbol, contractUri, beneficiaryAddress]);

    // Create proxy contract factory and deploy
    const proxyContract = contracts('2');
    const signer = Signer.isSigner(provider) ? provider : new providers.Web3Provider(provider).getSigner();
    const factory = new ContractFactory(proxyContract.abi, proxyContract.bytecode, signer);
    const { address, deployTransaction } = await factory.deploy(memberNftContract.address, abiEncoded);

    return {
      address,
      transaction: parseTransactionData(deployTransaction),
    };
  }

  /**
   * Generates a new mint voucher
   * @param minter Ethereum account being given permission to mint
   * @param quantity Quantity of tokens being whitelisted for mint
   * @param roleId ID of the role the user is being whitelisted for
   * @remarks Caller of this function must be assigned MINTER_ROLE
   * @returns Signed mint voucher
   */
  public async signMintVoucher(minter:string, quantity:number, tierId:number): Promise<NftMintVoucher> {
    await this.onlyRole('MINTER_ROLE');
    await this.tierInfo(tierId);

    const name = await this.name();
    const chainId = await this.getChainId();
    const balance = (await this.balanceOf(minter)) + quantity;
    const voucher = formatNftVoucher(chainId, name, this.address, balance, tierId, minter);
    const signature = await this.signTypedData(voucher);

    return {
      minter, balance, tierId, signature,
    };
  }

  /**
   * Attempts to retrieve a previously signed mint voucher for specified account and current contract address
   * @param minter Account to check for previously signed vouchers
   * @param roleId ID of the role that the voucher being searched for is authorizing
   * @remarks Calls ZKL signer API service
   * @returns Valid mint voucher (if exists)
   */
  public async getMintVoucher(minter:string, roleId:string): Promise<NftMintVoucher> {
    isEthereumAddress(minter);
    const chainId = await this.getChainId();
    const voucher = await getNftMintVoucher({
      contractAddress: this.address, userAddress: minter, chainId, roleId,
    });
    return voucher;
  }

  /**
   * Mints a new NFT and transfers it to specified account
   * @param to Ethereum account to recieve newly minted NFT
   * @param metadata Arbitrary JSON to be stored as NFT metadata. Must include roleId field
   * @remarks Caller of this function must be assigned MINTER_ROLE
   * @returns Unmined mint transaction
   */
  public async mintTo(to:string, metadata:{ tierId:number, [key: string]: any }) {
    const { name: tierName } = await this.getTier(metadata.tierId);
    const currentBalance = await this.totalSupply();
    const file = new Blob([JSON.stringify({ tierName, ...metadata })], { type: 'application/json' });
    const response = await this.ipfsModule.addFiles([{ file, fileName: `${currentBalance}.json` }]);
    const ipfsCid = `ipfs://${response[0].Hash}`;
    const tx = await this.mintToWithUri(to, metadata.tierId, ipfsCid);
    return tx;
  }

  /**
   * Mint a new NFT and transfer it to minter (defined in voucher)
   * @param voucher Valid mint voucher signed by account with MINTER_ROLE
   * @param metadata Arbitrary JSON to be stored as NFT metadata. Must include roleId field.
   * @returns Unmined mint transaction
   */
  public async mint(voucher:NftMintVoucher, metadata:{ tierId:number, [key: string]: any }) {
    const { name: tierName } = await this.getTier(metadata.tierId);
    const currentBalance = await this.totalSupply();
    const file = new Blob([JSON.stringify({ tierName, ...metadata })], { type: 'application/json' });
    const response = await this.ipfsModule.addFiles([{ file, fileName: `${currentBalance}.json` }]);
    const ipfsCid = `ipfs://${response[0].Hash}`;
    const tx = await this.mintWithUri(voucher, ipfsCid);
    return tx;
  }
}

applyMixins(MemberNftV2, [MemberNftV2ReadOnly, ERC721MembershipV2]);

export { MemberNftV2, MemberNftV2ReadOnly };
