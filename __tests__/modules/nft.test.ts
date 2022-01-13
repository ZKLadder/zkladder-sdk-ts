import { Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../../src/interfaces/address';
import Nft from '../../src/modules/nft';
import ethersNftAbstraction from '../mocks/ethersNftAbstraction';
import { parseTransactionData, parseMinedTransactionData } from '../../src/utils/contract/conversions';

// Extend NftEnumerable and unit test its methods
class NftWrapper extends Nft {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn().mockImplementation((address) => (address)),
}));

jest.mock('../../src/utils/contract/conversions', () => ({
  parseTransactionData: jest.fn(),
  parseMinedTransactionData: jest.fn(),
}));

const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;
const mockParseTransaction = parseTransactionData as jest.Mocked<any>;
const mockParseMinedTransaction = parseMinedTransactionData as jest.Mocked<any>;

describe('NftEnumerable class', () => {
  const nftWrapper = new NftWrapper(
    '0x12345' as EthereumAddress,
    ethersNftAbstraction as any,
  );

  test('name correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.name.mockResolvedValueOnce('mockNFT');

    const result = await nftWrapper.name();

    expect(ethersNftAbstraction.name).toHaveBeenCalledTimes(1);
    expect(result).toEqual('mockNFT');
  });

  test('symbol correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.symbol.mockResolvedValueOnce('MNFT');

    const result = await nftWrapper.symbol();

    expect(ethersNftAbstraction.symbol).toHaveBeenCalledTimes(1);
    expect(result).toEqual('MNFT');
  });

  test('ownerOf correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.ownerOf.mockResolvedValueOnce('0xmockOwner');

    const result = await nftWrapper.ownerOf(1);

    expect(ethersNftAbstraction.ownerOf).toHaveBeenCalledWith(1);
    expect(result).toEqual('0xmockOwner');
  });

  test('balanceOf correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.balanceOf.mockResolvedValueOnce({ toNumber: () => (10) });

    const result = await nftWrapper.balanceOf('0xMockOwner');

    expect(ethersNftAbstraction.balanceOf).toHaveBeenCalledWith('0xMockOwner');
    expect(result).toEqual(10);
  });

  test('totalSupply correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.totalSupply.mockResolvedValueOnce({ toNumber: () => (10) });

    const result = await nftWrapper.totalSupply();

    expect(ethersNftAbstraction.totalSupply).toHaveBeenCalledTimes(1);
    expect(result).toEqual(10);
  });

  test('tokenUri correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.tokenURI.mockResolvedValueOnce('https://mockToken.com/3');

    const result = await nftWrapper.tokenUri(3);

    expect(ethersNftAbstraction.tokenURI).toHaveBeenCalledWith(3);
    expect(result).toEqual('https://mockToken.com/3');
  });

  test('baseUri correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.baseUri.mockResolvedValueOnce('https://mockToken.com');

    const result = await nftWrapper.baseUri();

    expect(ethersNftAbstraction.baseUri).toHaveBeenCalledTimes(1);
    expect(result).toEqual('https://mockToken.com');
  });

  test('supportsInterface correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.supportsInterface.mockResolvedValueOnce(true);

    const result = await nftWrapper.supportsInterface('interfaceId');

    expect(ethersNftAbstraction.supportsInterface).toHaveBeenCalledWith('interfaceId');
    expect(result).toEqual(true);
  });

  test('getToken correctly calls dependencies and returns results', async () => {
    jest.spyOn(nftWrapper, 'tokenUri').mockImplementationOnce(() => (Promise.resolve('https://mockNft.com')));
    jest.spyOn(nftWrapper, 'ownerOf').mockImplementation(() => (Promise.resolve('0xtokenHolder') as any));

    const token = await nftWrapper.getToken(1);

    expect(nftWrapper.tokenUri).toHaveBeenCalledWith(1);
    expect(nftWrapper.ownerOf).toHaveBeenCalledWith(1);

    expect(token).toStrictEqual({
      tokenId: 1,
      tokenUri: 'https://mockNft.com',
      owner: '0xtokenHolder',
    });
  });

  test('getAllTokens correctly calls dependencies and returns results', async () => {
    jest.spyOn(nftWrapper, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(nftWrapper, 'getToken').mockImplementation(() => (Promise.resolve('token') as any));

    const result = await nftWrapper.getAllTokens();

    expect(nftWrapper.totalSupply).toHaveBeenCalledTimes(1);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(0);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(1);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(2);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(3);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(4);

    expect(result).toStrictEqual(new Array(5).fill('token'));
  });

  test('getAllTokensOwnedBy correctly calls dependencies and returns results', async () => {
    jest.spyOn(nftWrapper, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(nftWrapper, 'getToken').mockImplementation(() => (Promise.resolve('token') as any));

    const result = await nftWrapper.getAllTokens();

    expect(nftWrapper.totalSupply).toHaveBeenCalledTimes(1);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(0);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(1);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(2);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(3);
    expect(nftWrapper.getToken).toHaveBeenCalledWith(4);

    expect(result).toStrictEqual(new Array(5).fill('token'));
  });

  test('getApproved correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.getApproved.mockResolvedValueOnce('0x12345');

    const result = await nftWrapper.getApproved(3);

    expect(ethersNftAbstraction.getApproved).toHaveBeenCalledWith(3);
    expect(result).toEqual('0x12345');
  });

  test('isApprovedForAll correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.isApprovedForAll.mockResolvedValueOnce(true);

    const result = await nftWrapper.isApprovedForAll('0xowner', '0xoperator');

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xowner');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xoperator');
    expect(ethersNftAbstraction.isApprovedForAll).toHaveBeenCalledWith('0xowner', '0xoperator');
    expect(result).toEqual(true);
  });

  test('safeTransferFrom correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction['safeTransferFrom(address,address,uint256)'].mockResolvedValueOnce({ mock: 'result' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'result' });

    const result = await nftWrapper.safeTransferFrom('0xowner', '0xoperator', 3);

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xowner');
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xoperator');
    expect(ethersNftAbstraction['safeTransferFrom(address,address,uint256)']).toHaveBeenCalledWith('0xowner', '0xoperator', 3);
    expect(mockParseTransaction).toHaveBeenCalledWith({ mock: 'result' });
    expect(result).toEqual({ parsed: 'result' });
  });

  test('safeTransferFromAndWait correctly calls dependencies and returns results', async () => {
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWrapper, 'safeTransferFrom').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWrapper.safeTransferFromAndWait('0xowner', '0xoperator', 3);

    expect(nftWrapper.safeTransferFrom).toHaveBeenCalledWith('0xowner', '0xoperator', 3);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('approve correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.approve.mockResolvedValueOnce({ mock: 'result' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'result' });

    const result = await nftWrapper.approve('0xoperator', 3);

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xoperator');
    expect(ethersNftAbstraction.approve).toHaveBeenCalledWith('0xoperator', 3);
    expect(mockParseTransaction).toHaveBeenCalledWith({ mock: 'result' });
    expect(result).toEqual({ parsed: 'result' });
  });

  test('approveAndWait correctly calls dependencies and returns results', async () => {
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWrapper, 'approve').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWrapper.approveAndWait('0xoperator', 3);

    expect(nftWrapper.approve).toHaveBeenCalledWith('0xoperator', 3);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('setApprovalForAll correctly calls dependencies and returns results', async () => {
    ethersNftAbstraction.setApprovalForAll.mockResolvedValueOnce({ mock: 'result' });
    mockParseTransaction.mockReturnValueOnce({ parsed: 'result' });

    const result = await nftWrapper.setApprovalForAll('0xoperator', true);

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xoperator');
    expect(ethersNftAbstraction.setApprovalForAll).toHaveBeenCalledWith('0xoperator', true);
    expect(mockParseTransaction).toHaveBeenCalledWith({ mock: 'result' });
    expect(result).toEqual({ parsed: 'result' });
  });

  test('setApprovalForAllAndWait correctly calls dependencies and returns results', async () => {
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(nftWrapper, 'setApprovalForAll').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await nftWrapper.setApprovalForAllAndWait('0xoperator', true);

    expect(nftWrapper.setApprovalForAll).toHaveBeenCalledWith('0xoperator', true);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });
});
