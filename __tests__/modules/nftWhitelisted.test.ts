import { providers, Contract } from 'ethers';
import NftWhitelisted from '../../src/modules/nftWhitelisted';
import getContractABI from '../../src/utils/api/getContractABI';
import { isEthereumAddress } from '../../src/interfaces/address';
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

describe('NftWhitelisted class', () => {
  mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersNftWhitelistedAbstraction);

  test('setup correctly calls dependencies when instantiating nft class', async () => {
    const mockSupportsInterface = jest.spyOn(NftWhitelisted.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
    mockContract.mockReturnValueOnce(ethersNftWhitelistedAbstraction);

    const nft = await NftWhitelisted.setup('12345', 'mockProvider');

    expect(mockProviders.Web3Provider).toHaveBeenCalledWith('mockProvider');
    expect(mockContract).toHaveBeenCalledWith('12345', 'mockAbi', 'mockSigner');
    expect(nft instanceof NftWhitelisted).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup rethrows API errors', async () => {
    const mockSupportsInterface = jest.spyOn(NftWhitelisted.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockRejectedValueOnce('The ZKL API is not operational');
    mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
    mockContract.mockReturnValueOnce(ethersNftWhitelistedAbstraction);

    try {
      await NftWhitelisted.setup('12345', 'mockProvider');
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual('The ZKL API is not operational');
    }
    mockSupportsInterface.mockRestore();
  });

  test('beneficiaryAddress correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
    ethersNftWhitelistedAbstraction.beneficiaryAddress.mockResolvedValueOnce('0xbeneficiary');

    const result = await nftWhitelisted.beneficiaryAddress();

    expect(ethersNftWhitelistedAbstraction.beneficiaryAddress).toHaveBeenCalledTimes(1);
    expect(result).toEqual('0xbeneficiary');
  });

  test('salePrice correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
    ethersNftWhitelistedAbstraction.salePrice.mockResolvedValueOnce(100);
    mockWeiToEth.mockReturnValueOnce(10);

    const result = await nftWhitelisted.salePrice();

    expect(ethersNftWhitelistedAbstraction.salePrice).toHaveBeenCalledTimes(1);
    expect(mockWeiToEth).toHaveBeenCalledWith(100);
    expect(result).toEqual(10);
  });

  test('setSalePrice correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftWhitelisted.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
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
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
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
    jest.spyOn(NftWhitelisted.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
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
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
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
    jest.spyOn(NftWhitelisted.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
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
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
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
    jest.spyOn(NftWhitelisted.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
    ethersNftWhitelistedAbstraction.mintTo.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const result = await nftWhitelisted.mintTo('0x12345678', 'tokenUri');

    expect((nftWhitelisted as any).onlyRole).toHaveBeenCalledWith('MINTER_ROLE');
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x12345678');
    expect(ethersNftWhitelistedAbstraction.mintTo).toHaveBeenCalledWith('0x12345678', 'tokenUri');
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('mintToAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'mintTo').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWhitelisted.mintToAndWait('0x12345678', 'tokenUri');

    expect(nftWhitelisted.mintTo).toHaveBeenCalledWith('0x12345678', 'tokenUri');
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('mint correctly calls dependencies and returns results', async () => {
    jest.spyOn(NftWhitelisted.prototype as any, 'onlyRole').mockImplementationOnce(() => (null));
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
    ethersNftWhitelistedAbstraction.salePrice.mockResolvedValueOnce(111);
    ethersNftWhitelistedAbstraction.mint.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'transaction' });

    const voucher = { mint: 'voucher' } as any;

    const result = await nftWhitelisted.mint(voucher);

    expect(ethersNftWhitelistedAbstraction.salePrice).toHaveBeenCalledTimes(1);
    expect(mockParseTransaction).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(ethersNftWhitelistedAbstraction.mint).toHaveBeenCalledWith(voucher, { value: 111 });
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('mintAndWait correctly calls dependencies and returns results', async () => {
    const nftWhitelisted = await NftWhitelisted.setup('12345', 'mockProvider');
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWhitelisted, 'mint').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const voucher = { mint: 'voucher' } as any;

    const result = await nftWhitelisted.mintAndWait(voucher);

    expect(nftWhitelisted.mint).toHaveBeenCalledWith(voucher);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });
});
