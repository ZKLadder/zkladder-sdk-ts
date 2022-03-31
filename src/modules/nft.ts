import { Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { TransactionData } from '../interfaces/transaction';
import { parseTransactionData } from '../utils/contract/conversions';

/**
 * Adds query support for base ERC-721 defined functionality
 * https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721
 * @remarks Module is read-only and does not support transactions
 */
class NftReadOnly {
  public readonly address: EthereumAddress;

  protected contractAbstraction: Contract;

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

  public async tokenUri(tokenId:number): Promise<string> {
    const tokenUri = await this.contractAbstraction.tokenURI(tokenId);
    return tokenUri;
  }

  public async supportsInterface(interfaceId: string) : Promise<boolean> {
    const supportsInterface = await this.contractAbstraction.supportsInterface(interfaceId);
    return supportsInterface;
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
}

/**
 * Adds full support for base ERC-721 defined functionality
 * https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721
 */
class Nft extends NftReadOnly {
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
}

export { NftReadOnly, Nft };
