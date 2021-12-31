import { providers, Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { NftTokenData } from '../interfaces/nft';
import { TransactionData, MinedTransactionData } from '../interfaces/transaction';
import getContractABI from '../utils/api/getContractABI';
import { parseTransactionData, parseMinedTransactionData } from '../utils/contract/conversions';

export default class Nft {
  public readonly address: EthereumAddress;

  private readonly ethersProvider: providers.Web3Provider;

  private readonly contractAbstraction: Contract;

  public static async setup(address:string, provider:any) {
    const nft = await new this(address, provider);
    const { ethersProvider } = nft;
    const { abi } = await getContractABI({ id: '1' });
    const contractAbstraction = new Contract(address, abi, ethersProvider.getSigner());
    Object.assign(nft, { contractAbstraction });
    if (await nft.supportsInterface('0x780e9d63')) return nft;
    throw new Error('The contract address that you have provided is not a valid ERC-721Enumerable');
  }

  private constructor(address:string, provider:any) {
    this.address = address as EthereumAddress;
    this.ethersProvider = new providers.Web3Provider(provider);
  }

  protected isSetUp() {
    if (!this.contractAbstraction) throw new Error('Please ensure you have used the setup function to instantiate this module');
  }

  /* Read-Only Functions */
  public async name(): Promise<string> {
    const name = await this.contractAbstraction.name();
    return name;
  }

  public async symbol(): Promise<string> {
    const symbol = await this.contractAbstraction.symbol();
    return symbol;
  }

  public async ownerOf(tokenId:number): Promise<EthereumAddress> {
    const ownerAddress = await this.contractAbstraction.ownerOf(tokenId);
    return isEthereumAddress(ownerAddress);
  }

  public async balanceOf(address: string): Promise<number> {
    isEthereumAddress(address);
    const balance = await this.contractAbstraction.balanceOf(address);
    return balance.toNumber();
  }

  public async totalSupply(): Promise<number> {
    const totalSupply = await this.contractAbstraction.totalSupply();
    return totalSupply.toNumber();
  }

  public async tokenUri(tokenId:number): Promise<String> {
    const tokenUri = await this.contractAbstraction.tokenURI(tokenId);
    return tokenUri;
  }

  /**
   * Get the address currently approved to transfer this token. Throws if tokenId does not exist.
   * @param tokenId
   * @returns The address currently approved to transfer this tokenId, or 0 if none is set.
   */
  public async getApproved(tokenId: number): Promise<EthereumAddress> {
    const approved = await this.contractAbstraction.getApproved(tokenId);
    return isEthereumAddress(approved);
  }

  /**
   * Checks if operator is approved to transfer every token owned by owner
   * @param owner
   * @param operator
   * @returns Boolean indicating if the operator is approved for all of the owners tokens.
   */
  public async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    isEthereumAddress(owner);
    isEthereumAddress(operator);
    const isApprovedForAll = await this.contractAbstraction.isApprovedForAll(owner, operator);
    return isApprovedForAll;
  }

  public async supportsInterface(interfaceId: string) : Promise<boolean> {
    const supportsInterface = await this.contractAbstraction.supportsInterface(interfaceId);
    return supportsInterface;
  }

  public async baseUri(): Promise<string> {
    const baseUri = await this.contractAbstraction.baseUri();
    return baseUri;
  }

  /**
   * Returns token data by index. Indexed from 0 ... totalSupply()
   * @param index
   * @returns Token data for token at index
   */
  public async tokenByIndex(index:number): Promise<NftTokenData> {
    const tokenId = (await this.contractAbstraction.tokenByIndex(index))?.toNumber();
    const tokenUri = await this.contractAbstraction.tokenURI(tokenId);
    const owner = await this.contractAbstraction.ownerOf(tokenId);
    return { tokenId, tokenUri, owner };
  }

  /**
   * Returns token data owned by owner at index. Indexed from 0 ... balance(owner)
   * @param owner
   * @param index
   * @returns Token data for token owned by owner at index
   */
  public async tokenOfOwnerByIndex(owner:string, index:number): Promise<NftTokenData> {
    const tokenOwner = isEthereumAddress(owner);
    const tokenId = (await this.contractAbstraction.tokenOfOwnerByIndex(owner, index))?.toNumber();
    const tokenUri = await this.contractAbstraction.tokenURI(tokenId);
    return { tokenId, tokenUri, owner: tokenOwner };
  }

  /**
   * Get all tokens at this contract address
   * @returns An array of token data objects
   */
  public async getAllTokens(): Promise <NftTokenData[]> {
    const total = await this.totalSupply();
    const promises = [];
    for (let tokenIndex = 0; tokenIndex < total; tokenIndex += 1) {
      promises.push(this.tokenByIndex(tokenIndex));
    }
    const results = await Promise.all(promises);
    return results;
  }

  /**
   * Get all tokens owned by owner
   * @param owner
   * @returns An array of token data objects
   */
  public async getAllTokensOwnedBy(owner:string): Promise<NftTokenData[]> {
    isEthereumAddress(owner);

    const total = await this.balanceOf(owner);

    const promises = [];
    for (let tokenIndex = 0; tokenIndex < total; tokenIndex += 1) {
      promises.push(this.tokenOfOwnerByIndex(owner, tokenIndex));
    }
    const results = await Promise.all(promises);
    return results;
  }

  /* Transactions */

  /**
   * Mints a new NFT owned by the signer address provided at SDK instantiation
   * @returns Transaction data
   */
  public async mint(): Promise<TransactionData> {
    const tx = await this.contractAbstraction.mint();
    return parseTransactionData(tx);
  }

  /**
   * Mints a new NFT owned by the signer address provided at SDK instantiation and waits for it to be mined
   * @returns Mined transaction data
   */
  public async mintAndWait(): Promise<MinedTransactionData> {
    const tx = await this.contractAbstraction.mint();
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  /**
   * Transfers tokenId from the from address to the to address.
   * @remarks tokenId must be owned by the from address, or the from address must be approved to transfer tokenId
   * @param from
   * @param to
   * @param tokenId
   * @returns Transaction data
   */
  public async safeTransferFrom(from:string, to:string, tokenId:number): Promise<TransactionData> {
    isEthereumAddress(from);
    isEthereumAddress(to);

    const tx = await this.contractAbstraction['safeTransferFrom(address,address,uint256)'](from, to, tokenId);
    return parseTransactionData(tx);
  }

  /**
   * Transfers tokenId from the from address to the to address and waits for the transaction to be mined.
   * @remarks tokenId must be owned by the from address, or the from address must be approved to transfer tokenId
   * @param from
   * @param to
   * @param tokenId
   * @returns Mined transaction data
   */
  public async safeTransferFromAndWait(from:string, to:string, tokenId:number): Promise<MinedTransactionData> {
    const tx = await this.safeTransferFrom(from, to, tokenId);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  /**
   * Approve operator to transfer tokenId
   * @param operator
   * @param tokenId
   * @returns Transaction data
   */
  public async approve(operator: string, tokenId:number): Promise<TransactionData> {
    isEthereumAddress(operator);
    const tx = await this.contractAbstraction.approve(operator, tokenId);
    return parseTransactionData(tx);
  }

  /**
   * Approve operator to transfer tokenId and wait for the transaction to be mined
   * @param operator
   * @param tokenId
   * @returns Mined transaction data
   */
  public async approveAndWait(operator: string, tokenId:number): Promise<MinedTransactionData> {
    const tx = await this.approve(operator, tokenId);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  /**
   * Toggles approval for operater to transfer all tokens owned by transaction sender
   * @remarks Transaction sender will be the signer address provided at SDK instantiation
   * @param operator
   * @param approved
   * @returns Transaction data
   */
  public async setApprovalForAll(operator: string, approved:boolean): Promise<TransactionData> {
    isEthereumAddress(operator);
    const tx = await this.contractAbstraction.setApprovalForAll(operator, approved);
    return parseTransactionData(tx);
  }

  /**
   * Toggles approval for operater to transfer all tokens owned by transaction sender and waits for transaction to be mined
   * @remarks Transaction sender will be the signer address provided at SDK instantiation
   * @param operator
   * @param approved
   * @returns Transaction data
   */
  public async setApprovalForAllAndWait(operator: string, approved:boolean): Promise<MinedTransactionData> {
    const tx = await this.setApprovalForAll(operator, approved);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }
}
