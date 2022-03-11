import { providers, Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { Role, NftMintVoucher } from '../interfaces/nftLazyMint';
import { TransactionData, MinedTransactionData } from '../interfaces/transaction';
import { parseTransactionData, parseMinedTransactionData } from '../utils/contract/conversions';
import applyMixins from '../utils/mixins/applyMixins';
import Nft from './nft';
import AccessControl from './accessControl';
import Provider from './provider';

interface NftLazyMint extends Nft, AccessControl, Provider {}

class NftLazyMint {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.Web3Provider;

  protected readonly contractAbstraction: Contract;

  protected async onlyRole(role:Role): Promise<void> {
    const primaryAccount = await this.getPrimaryAccount();
    const hasRole = await this.hasRole(role, primaryAccount);
    if (!hasRole) throw new Error('The account you are connected with is not the administrator of this contract');
  }

  /* Read-Only Functions */
  public async beneficiaryAddress(): Promise<EthereumAddress> {
    const beneficiary = await this.contractAbstraction.beneficiaryAddress();
    return beneficiary;
  }

  public async collectionDataUri(): Promise<string> {
    const collectionDataUri = await this.contractAbstraction.collectionDataUri();
    return collectionDataUri;
  }

  /* Transactions */
  public async setCollectionDataUri(newCollectionDataUri:string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setCollectionDataUri(newCollectionDataUri);
    return parseTransactionData(tx);
  }

  public async setCollectionDataUriAndWait(newCollectionDataUri:string): Promise<MinedTransactionData> {
    const tx = await this.setCollectionDataUri(newCollectionDataUri);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  public async setBeneficiary(newBeneficiary:string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    isEthereumAddress(newBeneficiary);
    const tx = await this.contractAbstraction.setBeneficiary(newBeneficiary);
    return parseTransactionData(tx);
  }

  public async setBeneficiaryAndWait(newBeneficiary:string): Promise<MinedTransactionData> {
    const tx = await this.setBeneficiary(newBeneficiary);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  public async transferOwnership(newOwner:string): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    isEthereumAddress(newOwner);
    const tx = await this.contractAbstraction.transferOwnership(newOwner);
    return parseTransactionData(tx);
  }

  public async transferOwnershipAndWait(newOwner:string): Promise<MinedTransactionData> {
    const tx = await this.transferOwnership(newOwner);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  public async mintToWithUri(to:string, tokenUri:string): Promise<TransactionData> {
    await this.onlyRole('MINTER_ROLE');
    isEthereumAddress(to);
    const tx = await this.contractAbstraction.mintTo(to, tokenUri);
    return parseTransactionData(tx);
  }

  public async mintToWithUriAndWait(to:string, tokenUri:string): Promise<MinedTransactionData> {
    const tx = await this.mintToWithUri(to, tokenUri);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  public async mintWithUri(voucher: NftMintVoucher, tokenUri:string): Promise<TransactionData> {
    const tx = await this.contractAbstraction.mint(voucher, tokenUri, { value: voucher.salePrice });
    return parseTransactionData(tx);
  }

  public async mintWithUriAndWait(voucher: NftMintVoucher, tokenUri:string): Promise<MinedTransactionData> {
    const tx = await this.mintWithUri(voucher, tokenUri);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  public async isTransferrable(): Promise<boolean> {
    const isTransferrable = await this.contractAbstraction.isTransferrable();
    return isTransferrable;
  }

  public async royaltyBasis(): Promise<number> {
    const royaltyBasis = await this.contractAbstraction.royaltyBasis();
    return royaltyBasis;
  }

  public async setRoyalty(royaltyBasis:number): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setRoyalty(royaltyBasis);
    return parseTransactionData(tx);
  }

  public async setRoyaltyAndWait(royaltyBasis:number): Promise<MinedTransactionData> {
    const tx = await this.setRoyalty(royaltyBasis);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  public async setIsTransferrable(isTransferrable:boolean): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setIsTransferrable(isTransferrable);
    return parseTransactionData(tx);
  }

  public async setIsTransferrableAndWait(isTransferrable:boolean): Promise<MinedTransactionData> {
    const tx = await this.setIsTransferrable(isTransferrable);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }
}

applyMixins(NftLazyMint, [Nft, AccessControl, Provider]);

export default NftLazyMint;
