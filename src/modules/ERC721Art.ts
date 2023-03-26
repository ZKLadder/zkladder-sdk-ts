import { providers, Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { Role } from '../interfaces/erc721Art';
import { TransactionData } from '../interfaces/transaction';
import { ethToWei, parseTransactionData, weiToEth } from '../utils/contract/conversions';
import applyMixins from '../utils/mixins/applyMixins';
import { NftReadOnly, Nft } from './nft';
import { AccessControlReadOnly, AccessControl } from './accessControl';
import Provider from './provider';

interface ERC721ArtReadOnly extends NftReadOnly, AccessControlReadOnly { }

/**
 * Adds query support for ZKLadder ERC-721 Whitelisted contract template
 * @TODO Add Github/documentation link
 * @remarks Module is read-only and does not support transactions
 */
class ERC721ArtReadOnly {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.BaseProvider;

  protected contractAbstraction: Contract;

  /* Read-Only Functions */
  public async beneficiaryAddress(): Promise<EthereumAddress> {
    const beneficiary = await this.contractAbstraction.beneficiaryAddress();
    return beneficiary;
  }

  public async contractUri(): Promise<string> {
    const contractUri = await this.contractAbstraction.contractURI();
    return contractUri;
  }

  public async salePrice(): Promise<number> {
    const salePrice = await this.contractAbstraction.salePrice();
    return weiToEth(salePrice);
  }

  public async royaltyBasis(): Promise<number> {
    const royaltyBasis = await this.contractAbstraction.royaltyBasis();
    return royaltyBasis.toNumber();
  }
}

interface ERC721Art extends ERC721ArtReadOnly, Nft, AccessControl, Provider { }

/**
 * Adds full support for ZKLadder ERC-721 Whitelisted contract template
 * @TODO Add Github/documentation link
 */
class ERC721Art {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.Web3Provider;

  protected contractAbstraction: Contract;

  protected async onlyRole(role: Role): Promise<void> {
    const primaryAccount = await this.getPrimaryAccount();
    const hasRole = await this.hasRole(role, primaryAccount);
    if (!hasRole) throw new Error('The account you are connected with is not the administrator of this contract');
  }

  public async setContractUri(newContractUri: string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setContractUri(newContractUri);
    return parseTransactionData(tx);
  }

  public async setBeneficiary(newBeneficiary: string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    isEthereumAddress(newBeneficiary);
    const tx = await this.contractAbstraction.setBeneficiary(newBeneficiary);
    return parseTransactionData(tx);
  }

  public async setRoyalty(newRoyalty: number): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setRoyalty(newRoyalty);
    return parseTransactionData(tx);
  }

  public async setSalePrice(newSalePrice: number): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setSalePrice(ethToWei(newSalePrice));
    return parseTransactionData(tx);
  }

  public async mintToWithUri(to: string, tokenId: number, tokenUri: string): Promise<TransactionData> {
    isEthereumAddress(to);
    await this.onlyRole('MINTER_ROLE');
    const tx = await this.contractAbstraction.mintTo(to, tokenId, tokenUri);
    return parseTransactionData(tx);
  }

  public async batchMintToWithUri(tokens:{ to: string, tokenId: number, tokenUri: string }[]): Promise<TransactionData> {
    await this.onlyRole('MINTER_ROLE');
    const tx = await this.contractAbstraction.batchMintTo(tokens);
    return parseTransactionData(tx);
  }
}

applyMixins(ERC721ArtReadOnly, [NftReadOnly, AccessControlReadOnly]);
applyMixins(ERC721Art, [ERC721ArtReadOnly, Nft, AccessControl, Provider]);

export { ERC721ArtReadOnly, ERC721Art };
