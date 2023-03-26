import { providers, Contract } from 'ethers';
import { ERC721ArtReadOnly, ERC721Art } from '../../src/modules/ERC721Art';
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

class ERC721ArtReadOnlyWrapper extends ERC721ArtReadOnly {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

class ERC721ArtWrapper extends ERC721Art {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

describe('ERC721ArtReadOnly class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftLazyMintAbstraction);

  test('beneficiaryAddress correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721ArtReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.beneficiaryAddress.mockResolvedValueOnce('0xbeneficiary');

    const result = await nftWhitelisted.beneficiaryAddress();

    expect(ethersNftLazyMintAbstraction.beneficiaryAddress).toHaveBeenCalledTimes(1);
    expect(result).toEqual('0xbeneficiary');
  });

  test('contractUri correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721ArtReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.contractURI.mockResolvedValueOnce('ipfs://123456789');

    const result = await nftWhitelisted.contractUri();

    expect(ethersNftLazyMintAbstraction.contractURI).toHaveBeenCalledTimes(1);
    expect(result).toEqual('ipfs://123456789');
  });

  test('salePrice correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721ArtReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.salePrice.mockResolvedValueOnce({ toNumber: () => (100) });
    mockWeiToEth.mockReturnValue(100);

    const result = await nftWhitelisted.salePrice();

    expect(ethersNftLazyMintAbstraction.salePrice).toHaveBeenCalledTimes(1);
    expect(result).toEqual(100);
  });

  test('royaltyBasis correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = new ERC721ArtReadOnlyWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.royaltyBasis.mockResolvedValueOnce({ toNumber: () => (50) });

    const result = await nftWhitelisted.royaltyBasis();

    expect(ethersNftLazyMintAbstraction.royaltyBasis).toHaveBeenCalledTimes(1);
    expect(result).toEqual(50);
  });
});

describe('ERC721Art class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftLazyMintAbstraction);

  test('setContractUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721Art.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721ArtWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.setContractUri.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setContractUri('ipfs://123456789');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(ethersNftLazyMintAbstraction.setContractUri).toHaveBeenCalledWith('ipfs://123456789');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setBeneficiary correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721Art.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721ArtWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.setBeneficiary.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setBeneficiary('0x12345678');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftLazyMintAbstraction.setBeneficiary).toHaveBeenCalledWith('0x12345678');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setRoyalty correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721Art.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721ArtWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.setRoyalty.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.setRoyalty(50);

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(ethersNftLazyMintAbstraction.setRoyalty).toHaveBeenCalledWith(50);
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('setSalePrice correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721Art.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721ArtWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.setSalePrice.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });
    mockEthToWei.mockReturnValue(1000000);

    const result = await nftWhitelisted.setSalePrice(10);

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockEthToWei).toHaveBeenCalledWith(10);
    expect(ethersNftLazyMintAbstraction.setSalePrice).toHaveBeenCalledWith(1000000);
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('mintToWithUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721Art.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721ArtWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.mintTo.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.mintToWithUri('0x12345678', 5, 'tokenUri');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('MINTER_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftLazyMintAbstraction.mintTo).toHaveBeenCalledWith('0x12345678', 5, 'tokenUri');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('batchMintToWithUri correctly calls dependencies and returns results', async () => {
    jest.spyOn(ERC721Art.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = new ERC721ArtWrapper('12345' as EthereumAddress, ethersNftLazyMintAbstraction as any);
    ethersNftLazyMintAbstraction.batchMintTo.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.batchMintToWithUri([{ to: '0x12345678', tokenId: 5, tokenUri: 'tokenUri' }]);

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('MINTER_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(ethersNftLazyMintAbstraction.batchMintTo).toHaveBeenCalledWith([{ to: '0x12345678', tokenId: 5, tokenUri: 'tokenUri' }]);
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });
});
