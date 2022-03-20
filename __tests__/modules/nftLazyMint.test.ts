import { providers, Contract } from 'ethers';
import NftLazyMint from '../../src/modules/nftLazyMint';
import getContractABI from '../../src/utils/api/getContractABI';
import { isEthereumAddress, EthereumAddress } from '../../src/interfaces/address';
import ethersNftWhitelistedAbstraction from '../mocks/ethersNftWhitelistedAbstraction';
import {
  parseTransactionData, parseMinedTransactionData,
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

  test('contractUri correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.contractURI.mockResolvedValueOnce('ipfs://123456789');

    const result = await nftWhitelisted.contractUri();

    expect(ethersNftWhitelistedAbstraction.contractURI).toHaveBeenCalledTimes(1);
    expect(result).toEqual('ipfs://123456789');
  });

  test('setContractUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftLazyMint.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.setContractUri.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setContractUri('ipfs://123456789');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(ethersNftWhitelistedAbstraction.setContractUri).toHaveBeenCalledWith('ipfs://123456789');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setContractUriAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'setContractUri').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWhitelisted.setContractUriAndWait('ipfs://123456789');

    expect(nftWhitelisted.setContractUri).toHaveBeenCalledWith('ipfs://123456789');
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('baseUri correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.baseURI.mockResolvedValueOnce('ipfs://123456789');

    const result = await nftWhitelisted.baseUri();

    expect(ethersNftWhitelistedAbstraction.baseURI).toHaveBeenCalledTimes(1);
    expect(result).toEqual('ipfs://123456789');
  });

  test('setBaseUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftLazyMint.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.setBaseUri.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setBaseUri('ipfs://123456789');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(ethersNftWhitelistedAbstraction.setBaseUri).toHaveBeenCalledWith('ipfs://123456789');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setBaseUriAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'setBaseUri').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWhitelisted.setBaseUriAndWait('ipfs://123456789');

    expect(nftWhitelisted.setBaseUri).toHaveBeenCalledWith('ipfs://123456789');
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
    ethersNftWhitelistedAbstraction.mint.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const voucher = { mint: 'voucher', salePrice: 12345 } as any;

    const result = await nftWhitelisted.mintWithUri(voucher, 'tokenUri');

    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(ethersNftWhitelistedAbstraction.mint).toHaveBeenCalledWith(voucher, 'tokenUri', { value: 12345 });
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
