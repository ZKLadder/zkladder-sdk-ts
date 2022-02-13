import { providers, Contract } from 'ethers';
import NftLazyMint from '../../src/modules/nftLazyMint';
import getContractABI from '../../src/utils/api/getContractABI';
import { isEthereumAddress, EthereumAddress } from '../../src/interfaces/address';
import ethersNftWhitelistedAbstraction from '../mocks/ethersNftWhitelistedAbstraction';
import {
  parseTransactionData, parseMinedTransactionData, ethToWei, weiToEth,
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
const mockParseMinedTransaction = parseMinedTransactionData as jest.Mocked<any>;
const mockEthToWei = ethToWei as jest.Mocked<any>;
const mockWeiToEth = weiToEth as jest.Mocked<any>;

// Extend NftEnumerable and unit test its methods
class NftLazyMintWrapper extends NftLazyMint {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

describe('NftWhitelisted class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftWhitelistedAbstraction);

  test('beneficiaryAddress correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.beneficiaryAddress.mockResolvedValueOnce('0xbeneficiary');

    const result = await nftWhitelisted.beneficiaryAddress();

    expect(ethersNftWhitelistedAbstraction.beneficiaryAddress).toHaveBeenCalledTimes(1);
    expect(result).toEqual('0xbeneficiary');
  });

  test('salePrice correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.salePrice.mockResolvedValueOnce(100);
    mockWeiToEth.mockReturnValueOnce(10);

    const result = await nftWhitelisted.salePrice();

    expect(ethersNftWhitelistedAbstraction.salePrice).toHaveBeenCalledTimes(1);
    expect(mockWeiToEth).toHaveBeenCalledWith(100);
    expect(result).toEqual(10);
  });

  test('setSalePrice correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftLazyMint.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.setSalePrice.mockResolvedValueOnce({});
    mockEthToWei.mockReturnValueOnce(0.10);
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setSalePrice(10);

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(mockEthToWei).toHaveBeenCalledWith(10);
    expect(ethersNftWhitelistedAbstraction.setSalePrice).toHaveBeenCalledWith(0.10);
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setSalePriceAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'setSalePrice').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWhitelisted.setSalePriceAndWait(3);

    expect(nftWhitelisted.setSalePrice).toHaveBeenCalledWith(3);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('setBeneficiary correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftLazyMint.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.setBeneficiary.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setBeneficiary('0x12345678');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftWhitelistedAbstraction.setBeneficiary).toHaveBeenCalledWith('0x12345678');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setBeneficiaryAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'setBeneficiary').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWhitelisted.setBeneficiaryAndWait('0x12345678');

    expect(nftWhitelisted.setBeneficiary).toHaveBeenCalledWith('0x12345678');
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('transferOwnership correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftLazyMint.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.transferOwnership.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.transferOwnership('0x12345678');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftWhitelistedAbstraction.transferOwnership).toHaveBeenCalledWith('0x12345678');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('transferOwnershipAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'transferOwnership').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWhitelisted.transferOwnershipAndWait('0x12345678');

    expect(nftWhitelisted.transferOwnership).toHaveBeenCalledWith('0x12345678');
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('mintTo correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftLazyMint.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.mintTo.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.mintToWithUri('0x12345678', 'tokenUri');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('MINTER_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftWhitelistedAbstraction.mintTo).toHaveBeenCalledWith('0x12345678', 'tokenUri');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('mintToAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'mintToWithUri').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWhitelisted.mintToWithUriAndWait('0x12345678', 'tokenUri');

    expect(nftWhitelisted.mintToWithUri).toHaveBeenCalledWith('0x12345678', 'tokenUri');
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('mint correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftLazyMint.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.salePrice.mockResolvedValueOnce(111);
    ethersNftWhitelistedAbstraction.mint.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const voucher = { mint: 'voucher' } as any;

    const result = await nftWhitelisted.mintWithUri(voucher, 'tokenUri');

    expect(ethersNftWhitelistedAbstraction.salePrice).toHaveBeenCalledTimes(1);
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(ethersNftWhitelistedAbstraction.mint).toHaveBeenCalledWith(voucher, 'tokenUri', { value: 111 });
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('mintAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'mintWithUri').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const voucher = { mint: 'voucher' } as any;

    const result = await nftWhitelisted.mintWithUriAndWait(voucher, 'tokenUri');

    expect(nftWhitelisted.mintWithUri).toHaveBeenCalledWith(voucher, 'tokenUri');
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });
});
