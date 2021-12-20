import { providers, Contract } from 'ethers';
import Nft from '../../src/modules/nft';
import getContractABI from '../../src/utils/api/getContractABI';
import ethersNftAbstraction from '../mocks/ethersNftAbstraction';
import { isEthereumAddress } from '../../src/interfaces/address';

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

const mockGetContractAbi = getContractABI as jest.Mocked<any>;
const mockProviders = providers as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;

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

  test('Class methods correctly call the underlying contract abstraction', async () => {
    jest.spyOn(Nft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
    mockContract.mockReturnValue(ethersNftAbstraction);

    const nft = await Nft.setup('12345', 'mockProvider');

    // .name()
    await nft.name();
    expect(ethersNftAbstraction.name).toHaveBeenCalledTimes(1);
    ethersNftAbstraction.name.mockReset();

    // .symbol()
    await nft.symbol();
    expect(ethersNftAbstraction.symbol).toHaveBeenCalledTimes(1);
    ethersNftAbstraction.symbol.mockReset();

    // .ownerOf()
    await nft.ownerOf(1);
    expect(ethersNftAbstraction.ownerOf).toHaveBeenCalledWith(1);
    ethersNftAbstraction.ownerOf.mockReset();

    // .balanceOf
    ethersNftAbstraction.balanceOf.mockResolvedValue({
      toNumber: () => ('123'),
    });
    await nft.balanceOf('0x2345');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x2345');
    expect(ethersNftAbstraction.balanceOf).toHaveBeenCalledWith('0x2345');
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction.balanceOf.mockReset();

    // .totalSupply()
    ethersNftAbstraction.totalSupply.mockResolvedValue({
      toNumber: () => ('123'),
    });
    await nft.totalSupply();
    expect(ethersNftAbstraction.totalSupply).toHaveBeenCalledTimes(1);
    ethersNftAbstraction.totalSupply.mockReset();

    // .tokenUri()
    await nft.tokenUri(1);
    expect(ethersNftAbstraction.tokenURI).toHaveBeenCalledWith(1);
    ethersNftAbstraction.tokenURI.mockReset();

    // .getApproved()
    await nft.getApproved(1);
    expect(ethersNftAbstraction.getApproved).toHaveBeenCalledWith(1);
    ethersNftAbstraction.getApproved.mockReset();

    // .isApprovedForAll()
    await nft.isApprovedForAll('owner', 'operator');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('owner');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('operator');
    expect(ethersNftAbstraction.isApprovedForAll).toHaveBeenCalledWith('owner', 'operator');
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction.isApprovedForAll.mockReset();

    // .supportsInterface()
    await nft.supportsInterface('0x12345');
    expect(ethersNftAbstraction.supportsInterface).toHaveBeenCalledWith('0x12345');
    ethersNftAbstraction.supportsInterface.mockReset();

    // .baseUri()
    await nft.baseUri();
    expect(ethersNftAbstraction.baseUri).toHaveBeenCalledTimes(1);
    ethersNftAbstraction.baseUri.mockReset();

    // .tokenByIndex()
    await nft.tokenByIndex(1);
    expect(ethersNftAbstraction.tokenByIndex).toHaveBeenCalledWith(1);
    ethersNftAbstraction.tokenByIndex.mockReset();

    // .tokenOfOwnerByIndex()
    await nft.tokenOfOwnerByIndex('owner', 1);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('owner');
    expect(ethersNftAbstraction.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 1);
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction.tokenOfOwnerByIndex.mockReset();

    // .getAllTokens()
    ethersNftAbstraction.totalSupply.mockResolvedValue({
      toNumber: () => (5),
    });
    await nft.getAllTokens();
    expect(ethersNftAbstraction.totalSupply).toHaveBeenCalledTimes(1);
    expect(ethersNftAbstraction.tokenByIndex).toHaveBeenCalledWith(0);
    expect(ethersNftAbstraction.tokenByIndex).toHaveBeenCalledWith(1);
    expect(ethersNftAbstraction.tokenByIndex).toHaveBeenCalledWith(2);
    expect(ethersNftAbstraction.tokenByIndex).toHaveBeenCalledWith(3);
    expect(ethersNftAbstraction.tokenByIndex).toHaveBeenCalledWith(4);
    ethersNftAbstraction.tokenByIndex.mockReset();
    ethersNftAbstraction.totalSupply.mockReset();

    // .getAllTokensOwnedBy()
    ethersNftAbstraction.balanceOf.mockResolvedValue({
      toNumber: () => (5),
    });
    await nft.getAllTokensOwnedBy('owner');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('owner');
    expect(ethersNftAbstraction.balanceOf).toHaveBeenCalledTimes(1);
    expect(ethersNftAbstraction.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 0);
    expect(ethersNftAbstraction.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 1);
    expect(ethersNftAbstraction.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 2);
    expect(ethersNftAbstraction.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 3);
    expect(ethersNftAbstraction.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 4);
    ethersNftAbstraction.tokenOfOwnerByIndex.mockReset();
    ethersNftAbstraction.balanceOf.mockReset();
    mockIsEthereumAddress.mockClear();

    // Transactions
    const wait = jest.fn();

    // .mint()
    ethersNftAbstraction.mint.mockResolvedValue({});
    await nft.mint();
    expect(ethersNftAbstraction.mint).toHaveBeenCalledTimes(1);
    ethersNftAbstraction.mint.mockReset();

    // .mintAndWait()
    ethersNftAbstraction.mint.mockResolvedValue({ wait });
    wait.mockResolvedValue({});
    await nft.mintAndWait();
    expect(ethersNftAbstraction.mint).toHaveBeenCalledTimes(1);
    expect(wait).toHaveBeenCalledTimes(1);
    ethersNftAbstraction.mint.mockReset();
    wait.mockReset();

    // .safeTransferFrom()
    ethersNftAbstraction['safeTransferFrom(address,address,uint256)'].mockResolvedValue({});
    await nft.safeTransferFrom('from', 'to', 1);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('from');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('to');
    expect(ethersNftAbstraction['safeTransferFrom(address,address,uint256)']).toHaveBeenCalledWith('from', 'to', 1);
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction['safeTransferFrom(address,address,uint256)'].mockReset();

    // .safeTransferFromAndWait()
    ethersNftAbstraction['safeTransferFrom(address,address,uint256)'].mockResolvedValue({ wait });
    wait.mockResolvedValue({});
    await nft.safeTransferFromAndWait('from', 'to', 1);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('from');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('to');
    expect(ethersNftAbstraction['safeTransferFrom(address,address,uint256)']).toHaveBeenCalledWith('from', 'to', 1);
    expect(wait).toHaveBeenCalledTimes(1);
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction['safeTransferFrom(address,address,uint256)'].mockReset();
    wait.mockReset();

    // .approve()
    ethersNftAbstraction.approve.mockResolvedValue({});
    await nft.approve('operator', 1);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('operator');
    expect(ethersNftAbstraction.approve).toHaveBeenCalledWith('operator', 1);
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction.approve.mockReset();

    // .approveAndWait()
    ethersNftAbstraction.approve.mockResolvedValue({ wait });
    wait.mockResolvedValue({});
    await nft.approveAndWait('operator', 1);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('operator');
    expect(ethersNftAbstraction.approve).toHaveBeenCalledWith('operator', 1);
    expect(wait).toHaveBeenCalledTimes(1);
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction.approve.mockReset();
    wait.mockReset();

    // .setApprovalForAll()
    ethersNftAbstraction.setApprovalForAll.mockResolvedValue({});
    await nft.setApprovalForAll('operator', true);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('operator');
    expect(ethersNftAbstraction.setApprovalForAll).toHaveBeenCalledWith('operator', true);
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction.approve.mockReset();

    // .setApprovalForAllAndWait()
    ethersNftAbstraction.setApprovalForAll.mockResolvedValue({ wait });
    wait.mockResolvedValue({});
    await nft.setApprovalForAllAndWait('operator', true);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('operator');
    expect(ethersNftAbstraction.setApprovalForAll).toHaveBeenCalledWith('operator', true);
    expect(wait).toHaveBeenCalledTimes(1);
    mockIsEthereumAddress.mockClear();
    ethersNftAbstraction.approve.mockReset();
    wait.mockReset();
  });
});
