import {
  providers, Contract, ContractFactory, Signer,
} from 'ethers';
import axios from 'axios';
import InfuraIpfs from '../modules/infuraIpfs';
import NftLazyMint from '../modules/nftLazyMint';
import {
  NftConstructorArgs, NftDeploymentArgs, NftMintVoucher, CollectionRole,
} from '../interfaces/nftLazyMint';
import getContractABI from '../utils/api/getContractABI';
import getNftMintVoucher from '../utils/api/getNftMintVoucher';
import { EthereumAddress, isEthereumAddress } from '../interfaces/address';
import { parseMinedTransactionData, parseTransactionData } from '../utils/contract/conversions';
import { NftTokenData } from '../interfaces/nft';
import formatNftVoucher from '../utils/vouchers/nftVoucher';
import { validateConstructorParams } from '../utils/contract/validators';

const constructorGuard = { };

export default class MemberNft extends NftLazyMint {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.Web3Provider;

  protected readonly ethersSigner: Signer;

  private readonly ipfsModule: InfuraIpfs;

  constructor(guard:any, options: NftConstructorArgs) {
    if (guard !== constructorGuard) throw new Error('Cannot call constructor directly; Use MemberNft.setUp function');
    super();

    const {
      address, provider, infuraIpfsProjectId, infuraIpfsProjectSecret,
    } = options;

    this.address = isEthereumAddress(address);

    if (Signer.isSigner(provider)) { // ethers Wallet provided
      this.ethersProvider = provider.provider as providers.Web3Provider;
      this.ethersSigner = provider;
    } else { // EIP-1193 compliant object provided
      this.ethersProvider = new providers.Web3Provider(provider);
      this.ethersSigner = this.ethersProvider.getSigner();
    }

    this.ipfsModule = new InfuraIpfs(infuraIpfsProjectId, infuraIpfsProjectSecret);
  }

  /**
   * Creates a new instance of MemberNft at a specified address. Use this function instead of direct instantiation
   * @param options.provider Valid ethers Wallet instance or EIP-1193 compliant provider object
   * @param options.address Address of MemberNft contract to connect to
   * @param options.infuraIpfsProjectId Infura IPFS project ID. ZKL tech team will provide this value
   * @param options.infuraIpfsProjectSecret Infura IPFS project secret. ZKL tech team will provide this value
   * @returns New instance of MemberNft
   */
  public static async setup(options: NftConstructorArgs) {
    const whitelistedNftDrop = new this(constructorGuard, options);
    const { abi } = await getContractABI({ id: '3' });
    const contractAbstraction = new Contract(
      options.address,
      abi,
      whitelistedNftDrop.ethersSigner,
    );
    Object.assign(whitelistedNftDrop, { contractAbstraction });
    return whitelistedNftDrop;
  }

  /**
   * Deploys a new MemberNft smart contract to the currently connected chain
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
    const collectionDataUri = `ipfs://${response[0].Hash}`;

    // Validate constructor inputs
    const { abi, bytecode } = await getContractABI({ id: '3' });
    validateConstructorParams(abi, [name, symbol, collectionDataUri, beneficiaryAddress]);

    // Create contract object and deploy
    const signer = Signer.isSigner(provider) ? provider : new providers.Web3Provider(provider).getSigner();
    const factory = new ContractFactory(abi, bytecode, signer);
    const { address, deployTransaction } = await factory.deploy(name, symbol, collectionDataUri, beneficiaryAddress);

    return {
      address,
      transaction: parseTransactionData(deployTransaction),
    };
  }

  /**
   * Retrieve collection level metadata fields including collection name, symbol, beneficiaryAddress and roles config
   * @returns Collection level metadata
   */
  public async getCollectionMetadata(): Promise<NftDeploymentArgs['collectionData']> {
    const name = await this.name();
    const symbol = await this.symbol();
    const beneficiaryAddress = await this.beneficiaryAddress();
    const collectionUri = await this.collectionDataUri();
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
   * Retrieve collection level role definition by ID
   * @param roleId ID of role to be retrieved
   * @returns Role definition
   */
  public async getRoleData(roleId:string): Promise<CollectionRole> {
    const { roles } = await this.getCollectionMetadata();
    const roleToFind = roles?.find((role) => (role.id === roleId));
    if (!roleId || !roleToFind) throw new Error(`Role with id: ${roleId} not found in contract config`);
    return roleToFind;
  }

  /**
   * Get NFT by ID
   * @param tokenId
   * @returns NFT data
   */
  public async getToken(tokenId:number): Promise<NftTokenData> {
    const tokenUri = await this.tokenUri(tokenId);
    const owner = await this.ownerOf(tokenId);
    const metadataUrl = this.ipfsModule.getGatewayUrl(tokenUri);
    // @TODO Potentially refactor to use ipfs /cat
    const response = await axios.get(metadataUrl);
    const metadata = response.data;
    return {
      tokenId, tokenUri, owner, metadata,
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

  /**
   * Generates a new mint voucher
   * @param minter Ethereum account being given permission to mint
   * @param quantity Quantity of tokens being whitelisted for mint
   * @param roleId ID of the role the user is being whitelisted for
   * @remarks Caller of this function must be assigned MINTER_ROLE
   * @returns Signed mint voucher
   */
  public async signMintVoucher(minter:string, quantity:number, roleId:string): Promise<NftMintVoucher> {
    await this.onlyRole('MINTER_ROLE');

    const name = await this.name();
    const { price: salePrice } = await this.getRoleData(roleId);
    const chainId = await this.getChainId();
    const balance = (await this.balanceOf(minter)) + quantity;
    const voucher = formatNftVoucher(chainId, name, this.address, balance, salePrice, minter);
    const signature = await this.signTypedData(voucher);

    return {
      minter, balance, salePrice, signature,
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
  public async mintTo(to:string, metadata:{ roleId:string, [key: string]: any }) {
    await this.getRoleData(metadata.roleId);
    const currentBalance = await this.totalSupply();
    const file = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const response = await this.ipfsModule.addFiles([{ file, fileName: `${currentBalance}.json` }]);
    const ipfsCid = `ipfs://${response[0].Hash}`;
    const tx = await this.mintToWithUri(to, ipfsCid);
    return tx;
  }

  /**
   * Mints a new NFT and transfers it to specified account, only resolving when tx is mined
   * @param to Ethereum account to recieve newly minted NFT
   * @param metadata Arbitrary JSON to be stored as NFT metadata. Must include roleId field
   * @remarks Caller of this function must be assigned MINTER_ROLE
   * @returns Mined mint transaction
   */
  public async mintToAndWait(to:string, metadata:{ roleId:string, [key: string]: any }) {
    const tx = await this.mintTo(to, metadata);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  /**
   * Mint a new NFT and transfer it to minter (defined in voucher)
   * @param voucher Valid mint voucher signed by account with MINTER_ROLE
   * @param metadata Arbitrary JSON to be stored as NFT metadata. Must include roleId field.
   * @returns Unmined mint transaction
   */
  public async mint(voucher:NftMintVoucher, metadata:{ roleId:string, [key: string]: any }) {
    await this.getRoleData(metadata.roleId);
    const currentBalance = await this.totalSupply();
    const file = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const response = await this.ipfsModule.addFiles([{ file, fileName: `${currentBalance}.json` }]);
    const ipfsCid = `ipfs://${response[0].Hash}`;
    const tx = await this.mintWithUri(voucher, ipfsCid);
    return tx;
  }

  /**
   * Mint a new NFT and transfer it to minter (defined in voucher), only resolving when tx is mined
   * @param voucher Valid mint voucher signed by account with MINTER_ROLE
   * @param metadata Arbitrary JSON to be stored as NFT metadata. Must include roleId field.
   * @returns Mined mint transaction
   */
  public async mintAndWait(voucher:NftMintVoucher, metadata:{ roleId:string, [key: string]: any }) {
    const tx = await this.mint(voucher, metadata);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }
}
