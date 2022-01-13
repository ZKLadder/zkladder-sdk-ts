import { providers, Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { Role, MintVoucher } from '../interfaces/nftWhitelisted';
import { TransactionData, MinedTransactionData } from '../interfaces/transaction';
import getContractABI from '../utils/api/getContractABI';
import {
  parseTransactionData, parseMinedTransactionData, ethToWei, weiToEth,
} from '../utils/contract/conversions';
import applyMixins from '../utils/mixins/applyMixins';
import Nft from './nft';
import AccessControl from './accessControl';
import Provider from './provider';

interface NftWhitelisted extends Nft, AccessControl, Provider {}

class NftWhitelisted {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.Web3Provider;

  protected readonly contractAbstraction: Contract;

  public static async setup(address:string, provider:any) {
    const nft = await new this(address, provider);
    const { ethersProvider } = nft;
    const { abi } = await getContractABI({ id: '3' });
    const contractAbstraction = new Contract(address, abi, ethersProvider.getSigner());
    Object.assign(nft, { contractAbstraction });
    return nft;
  }

  constructor(address:string, provider:any) {
    this.address = address as EthereumAddress;
    this.ethersProvider = new providers.Web3Provider(provider);
  }

  private async onlyRole(role:Role): Promise<void> {
    const primaryAccount = await this.getPrimaryAccount();
    const hasRole = await this.hasRole(role, primaryAccount);
    if (!hasRole) throw new Error('The account you are connected with is not the administrator of this contract');
  }

  protected isSetUp() {
    if (!this.contractAbstraction) throw new Error('Please ensure you have used the setup function to instantiate this module');
  }

  /* Read-Only Functions */
  public async beneficiaryAddress(): Promise<EthereumAddress> {
    const beneficiary = await this.contractAbstraction.beneficiaryAddress();
    return beneficiary;
  }

  public async salePrice(): Promise<number> {
    const salePrice = await this.contractAbstraction.salePrice();
    return weiToEth(salePrice);
  }

  /* Transactions */
  public async setSalePrice(newPrice:number): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.setSalePrice(
      ethToWei(newPrice),
    );
    return parseTransactionData(tx);
  }

  public async setSalePriceAndWait(newPrice:number): Promise<MinedTransactionData> {
    const tx = await this.setSalePrice(newPrice);
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

  public async mintTo(to:string, tokenUri:string): Promise<TransactionData> {
    await this.onlyRole('MINTER_ROLE');
    isEthereumAddress(to);
    const tx = await this.contractAbstraction.mintTo(to, tokenUri);
    return parseTransactionData(tx);
  }

  public async mintToAndWait(to:string, tokenUri:string): Promise<MinedTransactionData> {
    const tx = await this.mintTo(to, tokenUri);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }

  public async mint(voucher: MintVoucher): Promise<TransactionData> {
    const mintPrice = await this.contractAbstraction.salePrice();
    const tx = await this.contractAbstraction.mint(voucher, { value: mintPrice });
    return parseTransactionData(tx);
  }

  public async mintAndWait(voucher: MintVoucher): Promise<MinedTransactionData> {
    const tx = await this.mint(voucher);
    const mined = await tx.wait();
    return parseMinedTransactionData(mined);
  }
}

applyMixins(NftWhitelisted, [Nft, AccessControl, Provider]);

export default NftWhitelisted;
