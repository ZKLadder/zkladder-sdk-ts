import { providers, Contract } from 'ethers';
import { ERC721MembershipV2ReadOnly, ERC721MembershipV2 } from '../../src/modules/ERC721MembershipV2';
import getContractABI from '../../src/utils/api/getContractABI';
import { isEthereumAddress, EthereumAddress } from '../../src/interfaces/address';
import ethersNftLazyMintAbstraction from '../mocks/ethersNftLazyMintAbstraction';
import {
  parseTransactionData,
  weiToEth,
  ethToWei,
} from '../../src/utils/contract/conversions';

jest.mock('../../src/utils/api/getContractABI', () => (jest.fn()));

jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
}));

jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn().mockImplementation((address) => (address)),
}));

jest.mock('../../src/utils/contract/conversions', () => ({
  parseTransactionData: jest.fn(),
  parseMinedTransactionData: jest.fn(),
  ethToWei: jest.fn(),
  weiToEth: jest.fn(),
}));

const mockGetContractAbi = getContractABI as jest.Mocked<any>;
const mockProviders = providers as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;
const mockParseTransaction = parseTransactionData as jest.Mocked<any>;
const mockWeiToEth = weiToEth as jest.Mocked<any>;
const mockEthToWei = ethToWei as jest.Mocked<any>;

class ERC721MembershipV2ReadOnlyWrapper extends ERC721MembershipV2ReadOnly {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

class ERC721MembershipV2Wrapper extends ERC721MembershipV2 {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

describe('ERC721MembershipV2ReadOnly class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftLazyMintAbstraction);

  test('beneficiaryAddress correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721MembershipV2ReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.beneficiaryAddress.mockResolvedValueOnce('0xbeneficiary');

    const result = await nftWhitelisted.beneficiaryAddress();

    expect(ethersNftLazyMintAbstraction.beneficiaryAddress).toHaveBeenCalledTimes(1);
    expect(result).toEqual('0xbeneficiary');
  });

  test('contractUri correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721MembershipV2ReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.contractURI.mockResolvedValueOnce('ipfs://123456789');

    const result = await nftWhitelisted.contractUri();

    expect(ethersNftLazyMintAbstraction.contractURI).toHaveBeenCalledTimes(1);
    expect(result).toEqual('ipfs://123456789');
  });

  test('totalTiers correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721MembershipV2ReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.totalTiers.mockResolvedValueOnce({ toNumber: () => (10) });

    const result = await nftWhitelisted.totalTiers();

    expect(ethersNftLazyMintAbstraction.totalTiers).toHaveBeenCalledTimes(1);
    expect(result).toEqual(10);
  });

  test('tierInfo correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721MembershipV2ReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.tierInfo.mockResolvedValueOnce({
      tierURI: 'tier1',
      royaltyBasis: { toNumber: () => (500) },
      salePrice: { toNumber: () => (100) },
      isTransferable: true,
    });
    mockWeiToEth.mockReturnValue(100);

    const result = await nftWhitelisted.tierInfo(1);

    expect(ethersNftLazyMintAbstraction.tierInfo).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      tierURI: 'tier1',
      royaltyBasis: 500,
      salePrice: 100,
      isTransferable: true,
    });
  });

  test('tokenTier correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721MembershipV2ReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.tokenTiers.mockResolvedValueOnce(10);

    const result = await nftWhitelisted.tokenTiers(1);

    expect(ethersNftLazyMintAbstraction.tokenTiers).toHaveBeenCalledWith(1);
    expect(result).toEqual(10);
  });
});

describe('ERC721MembershipV2 class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftLazyMintAbstraction);

  test('setBeneficiary correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721MembershipV2.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721MembershipV2Wrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.setBeneficiary.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setBeneficiary('0x12345678');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftLazyMintAbstraction.setBeneficiary).toHaveBeenCalledWith('0x12345678');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('addTiers correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721MembershipV2.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721MembershipV2Wrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.addTiers.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const newTiers = [{
      tierURI: 'test', salePrice: 100, royaltyBasis: 500, isTransferable: true,
    }];

    const result = await nftWhitelisted.addTiersWithUri(newTiers);

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(ethersNftLazyMintAbstraction.addTiers).toHaveBeenCalledWith(newTiers);
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('updateTiers correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721MembershipV2.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721MembershipV2Wrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.updateTiers.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const newTiers = [{
      tierId: 1,
      tierUpdates: {
        tierURI: 'test', salePrice: 100, royaltyBasis: 500, isTransferable: true,
      },
    }];

    const result = await nftWhitelisted.updateTiersWithUri(newTiers);

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(ethersNftLazyMintAbstraction.updateTiers).toHaveBeenCalledWith(newTiers);
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setContractUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721MembershipV2.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721MembershipV2Wrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.setContractUri.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setContractUri('ipfs://123456789');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(ethersNftLazyMintAbstraction.setContractUri).toHaveBeenCalledWith('ipfs://123456789');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('mintToWithUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721MembershipV2.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    jest.spyOn(ERC721MembershipV2.prototype as any, 'tierInfo').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721MembershipV2Wrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.mintTo.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.mintToWithUri('0x12345678', 5, 0, 'tokenUri');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('MINTER_ROLE');
    expect((nftWhitelisted as any).tierInfo).toHaveBeenCalledWith(5);
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftLazyMintAbstraction.mintTo).toHaveBeenCalledWith('0x12345678', 5, 0, 'tokenUri');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('mintWithUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721MembershipV2.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    jest.spyOn(ERC721MembershipV2.prototype as any, 'tierInfo').mockImplementationOnce(() => ({ salePrice: 100000005 }));
    mockEthToWei.mockReturnValue(105);
    const nftWhitelisted = new ERC721MembershipV2Wrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.mint.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const voucher = {
      mint: 'voucher', minter: 'mockMinter', tierId: 123,
    } as any;

    const result = await nftWhitelisted.mintWithUri(voucher, 'tokenUri');

    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect((nftWhitelisted as any).tierInfo).toHaveBeenCalledWith(123);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('mockMinter');
    expect(mockEthToWei).toHaveBeenCalledWith(100000005);
    expect(ethersNftLazyMintAbstraction.mint).toHaveBeenCalledWith(voucher, 'tokenUri', { value: 105 });
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });
});
