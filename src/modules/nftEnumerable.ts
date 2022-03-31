import { Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { NftTokenData } from '../interfaces/nft';
import { TransactionData, MinedTransactionData } from '../interfaces/transaction';
import { NftReadOnly, Nft } from './nft';
import { parseTransactionData, parseMinedTransactionData } from '../utils/contract/conversions';
import applyMixins from '../utils/mixins/applyMixins';

/**
 * Adds query support for NFT's with the enumerable extension
 * https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Enumerable
 * @remarks Module is read-only and does not support transactions
 */
class NftEnumerableReadOnly extends NftReadOnly {
  public readonly address: EthereumAddress;

  protected contractAbstraction: Contract;

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
    isEthereumAddress(owner);
    const tokenId = (await this.contractAbstraction.tokenOfOwnerByIndex(owner, index))?.toNumber();
    const tokenUri = await this.contractAbstraction.tokenURI(tokenId);
    return { tokenId, tokenUri, owner: owner as EthereumAddress };
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
}

interface NftEnumerable extends NftEnumerableReadOnly, Nft {}

/**
 * Adds full support for NFT's with the enumerable extension
 * https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Enumerable
 */
class NftEnumerable {
  public readonly address: EthereumAddress;

  protected contractAbstraction: Contract;

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
}

applyMixins(NftEnumerable, [NftEnumerableReadOnly, Nft]);

export { NftEnumerableReadOnly, NftEnumerable };
