import { providers, Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import {
  Role, NftMintVoucher, Tier, TierUpdate,
} from '../interfaces/memberNftV2';
import { TransactionData } from '../interfaces/transaction';
import { parseTransactionData, weiToEth } from '../utils/contract/conversions';
import applyMixins from '../utils/mixins/applyMixins';
import { NftReadOnly, Nft } from './nft';
import { AccessControlReadOnly, AccessControl } from './accessControl';
import Provider from './provider';

interface ERC721MembershipV2ReadOnly extends NftReadOnly, AccessControlReadOnly { }

/**
 * Adds query support for ZKLadder ERC-721 Whitelisted contract template
 * @TODO Add Github/documentation link
 * @remarks Module is read-only and does not support transactions
 */
class ERC721MembershipV2ReadOnly {
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

  public async totalTiers(): Promise<number> {
    const tierCount = await this.contractAbstraction.totalTiers();
    return tierCount.toNumber();
  }

  public async tierInfo(tierId: number): Promise<Tier> {
    const {
      tierURI, royaltyBasis, salePrice, isTransferable,
    } = await this.contractAbstraction.tierInfo(tierId);
    return {
      tierURI,
      royaltyBasis: royaltyBasis.toNumber(),
      salePrice: weiToEth(salePrice),
      isTransferable,
    };
  }

  public async tokenTiers(tokenId: number): Promise<number> {
    const tierId = await this.contractAbstraction.tokenTiers(tokenId);
    return tierId;
  }
}

interface ERC721MembershipV2 extends ERC721MembershipV2ReadOnly, Nft, AccessControl, Provider { }

/**
 * Adds full support for ZKLadder ERC-721 Whitelisted contract template
 * @TODO Add Github/documentation link
 */
class ERC721MembershipV2 {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.Web3Provider;

  protected contractAbstraction: Contract;

  protected async onlyRole(role: Role): Promise<void> {
    const primaryAccount = await this.getPrimaryAccount();
    const hasRole = await this.hasRole(role, primaryAccount);
    if (!hasRole) throw new Error('The account you are connected with is not the administrator of this contract');
  }

  public async addTiersWithUri(tiers: Tier[]): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.addTiers(tiers);
    return parseTransactionData(tx);
  }

  public async updateTiersWithUri(tierUpdates: TierUpdate[]): Promise<TransactionData> {
    await this.onlyRole('DEFAULT_ADMIN_ROLE');
    const tx = await this.contractAbstraction.updateTiers(tierUpdates);
    return parseTransactionData(tx);
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

  public async mintToWithUri(to: string, tierId: number, tokenId: number, tokenUri: string): Promise<TransactionData> {
    isEthereumAddress(to);
    await this.onlyRole('MINTER_ROLE');
    await this.tierInfo(tierId);
    const tx = await this.contractAbstraction.mintTo(to, tierId, tokenId, tokenUri);
    return parseTransactionData(tx);
  }

  public async mintWithUri(voucher: NftMintVoucher, tokenUri: string): Promise<TransactionData> {
    isEthereumAddress(voucher.minter);
    const { salePrice } = await this.contractAbstraction.tierInfo(voucher.tierId);
    const tx = await this.contractAbstraction.mint(voucher, tokenUri, { value: salePrice });
    return parseTransactionData(tx);
  }
}

applyMixins(ERC721MembershipV2ReadOnly, [NftReadOnly, AccessControlReadOnly]);
applyMixins(ERC721MembershipV2, [ERC721MembershipV2ReadOnly, Nft, AccessControl, Provider]);

export { ERC721MembershipV2ReadOnly, ERC721MembershipV2 };
