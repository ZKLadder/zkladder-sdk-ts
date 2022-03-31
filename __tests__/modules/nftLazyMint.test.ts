import { providers, Contract } from 'ethers';
import { NftLazyMintReadOnly, NftLazyMint } from '../../src/modules/nftLazyMint';
import getContractABI from '../../src/utils/api/getContractABI';
import { isEthereumAddress, EthereumAddress } from '../../src/interfaces/address';
import ethersNftWhitelistedAbstraction from '../mocks/ethersNftWhitelistedAbstraction';
import {
  parseTransactionData,
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

class NftLazyMintReadOnlyWrapper extends NftLazyMintReadOnly {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

class NftLazyMintWrapper extends NftLazyMint {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

describe('NftLazyMint class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftWhitelistedAbstraction);

  test('beneficiaryAddress correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintReadOnlyWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.beneficiaryAddress.mockResolvedValueOnce('0xbeneficiary');

    const result = await nftWhitelisted.beneficiaryAddress();

    expect(ethersNftWhitelistedAbstraction.beneficiaryAddress).toHaveBeenCalledTimes(1);
    expect(result).toEqual('0xbeneficiary');
  });

  test('contractUri correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintReadOnlyWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.contractURI.mockResolvedValueOnce('ipfs://123456789');

    const result = await nftWhitelisted.contractUri();

    expect(ethersNftWhitelistedAbstraction.contractURI).toHaveBeenCalledTimes(1);
    expect(result).toEqual('ipfs://123456789');
  });

  test('baseUri correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new NftLazyMintReadOnlyWrapper('12345' as EthereumAddress, ethersNftWhitelistedAbstraction as any);
    ethersNftWhitelistedAbstraction.baseURI.mockResolvedValueOnce('ipfs://123456789');

    const result = await nftWhitelisted.baseUri();

    expect(ethersNftWhitelistedAbstraction.baseURI).toHaveBeenCalledTimes(1);
    expect(result).toEqual('ipfs://123456789');
  });
});

describe('NftLazyMint class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftWhitelistedAbstraction);

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
});
