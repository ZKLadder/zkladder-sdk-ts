import { providers, Contract } from 'ethers';
import Nft from '../../src/modules/nft';
import getContractABI from '../../src/utils/api/getContractABI';

jest.mock('../../src/utils/api/getContractABI', () => (jest.fn()));
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
}));

const mockGetContractAbi = getContractABI as jest.Mocked<any>;
const mockProviders = providers as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;

describe('Setup function', () => {
  test('Correctly calls dependencies when instantiating nft class', async () => {
    const mockSupportsInterface = jest.spyOn(Nft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
    mockContract.mockReturnValue({});

    const nft = await Nft.setup('12345', 'mockProvider');

    expect(mockSupportsInterface).toHaveBeenCalledWith('0x780e9d63');
    expect(mockProviders.Web3Provider).toHaveBeenCalledWith('mockProvider');
    expect(mockContract).toHaveBeenCalledWith('12345', 'mockAbi', 'mockSigner');
    expect(nft instanceof Nft).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('Throws if supportsInterface returns false', async () => {
    const mockSupportsInterface = jest.spyOn(Nft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(false)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
    mockContract.mockReturnValue({});

    try {
      await Nft.setup('12345', 'mockProvider');
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual(new Error('The contract address that you have provided is not a valid ERC-721Enumerable'));
    }
    mockSupportsInterface.mockRestore();
  });

  test('Rethrows API errors', async () => {
    const mockSupportsInterface = jest.spyOn(Nft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockRejectedValueOnce('The ZKL API is not operational');
    mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
    mockContract.mockReturnValue({});

    try {
      await Nft.setup('12345', 'mockProvider');
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual('The ZKL API is not operational');
    }
    mockSupportsInterface.mockRestore();
  });
});

describe('Class instance methods', () => {
  test('Implements supported methods', async () => {
    jest.spyOn(Nft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
    mockContract.mockReturnValue({});
    const nft = await Nft.setup('12345', 'mockProvider');
    expect(typeof nft.name).toBe('function');
    expect(typeof nft.symbol).toBe('function');
    expect(typeof nft.ownerOf).toBe('function');
    expect(typeof nft.balanceOf).toBe('function');
    expect(typeof nft.totalSupply).toBe('function');
    expect(typeof nft.tokenUri).toBe('function');
    expect(typeof nft.getApproved).toBe('function');
    expect(typeof nft.isApprovedForAll).toBe('function');
    expect(typeof nft.supportsInterface).toBe('function');
    expect(typeof nft.baseUri).toBe('function');
    expect(typeof nft.tokenByIndex).toBe('function');
    expect(typeof nft.tokenOfOwnerByIndex).toBe('function');
    expect(typeof nft.getAllTokens).toBe('function');
    expect(typeof nft.getAllTokensOwnedBy).toBe('function');
    expect(typeof nft.mint).toBe('function');
    expect(typeof nft.mintAndWait).toBe('function');
    expect(typeof nft.safeTransferFrom).toBe('function');
    expect(typeof nft.safeTransferFromAndWait).toBe('function');
    expect(typeof nft.approve).toBe('function');
    expect(typeof nft.approveAndWait).toBe('function');
    expect(typeof nft.setApprovalForAll).toBe('function');
    expect(typeof nft.setApprovalForAllAndWait).toBe('function');
  });
});
