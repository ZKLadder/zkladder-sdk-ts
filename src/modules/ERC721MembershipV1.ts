import { providers, Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { Role, NftMintVoucher } from '../interfaces/memberNftV1';
import { TransactionData } from '../interfaces/transaction';
import { parseTransactionData } from '../utils/contract/conversions';
import applyMixins from '../utils/mixins/applyMixins';
import { NftReadOnly, Nft } from './nft';
import { AccessControlReadOnly, AccessControl } from './accessControl';
import Provider from './provider';

interface ERC721MembershipV1ReadOnly extends NftReadOnly, AccessControlReadOnly {}

/**
 * Adds query support for ZKLadder ERC-721 Whitelisted contract template
 * @TODO Add Github/documentation link
 * @remarks Module is read-only and does not support transactions
 */
class ERC721MembershipV1ReadOnly {
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

  public async baseUri(): Promise<string> {
    const baseUri = await this.contractAbstraction.baseURI();
    return baseUri;
  }

  public async isTransferrable(): Promise<boolean> {
    const isTransferrable = await this.contractAbstraction.isTransferrable();
    return isTransferrable;
  }

  public async royaltyBasis(): Promise<number> {
    const royaltyBasis = await this.contractAbstraction.royaltyBasis();
    return royaltyBasis.toNumber();
  }
}

interface ERC721MembershipV1 extends ERC721MembershipV1ReadOnly, Nft, AccessControl, Provider {}

/**
 * Adds full support for ZKLadder ERC-721 Whitelisted contract template
 * @TODO Add Github/documentation link
 */
class ERC721MembershipV1 {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.Web3Provider;

  protected contractAbstraction: Contract;

  protected async onlyRole(role:Role): Promise<void> {
    const primaryAccount = await this.getPrimaryAccount();
    const hasRole = await this.hasRole(role, primaryAccount);
    if (!hasRole) throw new Error('The account you are connected with is not the administrator of this contract');
  }

  public async setContractUri(newContractUri:string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setContractUri(newContractUri);
    return parseTransactionData(tx);
  }

  public async setBaseUri(newBaseUri:string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setBaseUri(newBaseUri);
    return parseTransactionData(tx);
  }

  public async setBeneficiary(newBeneficiary:string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    isEthereumAddress(newBeneficiary);
    const tx = await this.contractAbstraction.setBeneficiary(newBeneficiary);
    return parseTransactionData(tx);
  }

  public async transferOwnership(newOwner:string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    isEthereumAddress(newOwner);
    const tx = await this.contractAbstraction.transferOwnership(newOwner);
    return parseTransactionData(tx);
  }

  public async mintToWithUri(to:string, tokenUri:string): Promise<TransactionData> {
    await this.onlyRole('MINTER_ROLE');
    isEthereumAddress(to);
    const tx = await this.contractAbstraction.mintTo(to, tokenUri);
    return parseTransactionData(tx);
  }

  public async mintWithUri(voucher: NftMintVoucher, tokenUri:string): Promise<TransactionData> {
    const tx = await this.contractAbstraction.mint(voucher, tokenUri, { value: voucher.salePrice });
    return parseTransactionData(tx);
  }

  public async setRoyalty(royaltyBasis:number): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setRoyalty(royaltyBasis);
    return parseTransactionData(tx);
  }

  public async setIsTransferrable(isTransferrable:boolean): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setIsTransferrable(isTransferrable);
    return parseTransactionData(tx);
  }
}

applyMixins(ERC721MembershipV1ReadOnly, [NftReadOnly, AccessControlReadOnly]);
applyMixins(ERC721MembershipV1, [ERC721MembershipV1ReadOnly, Nft, AccessControl, Provider]);

export { ERC721MembershipV1ReadOnly, ERC721MembershipV1 };
