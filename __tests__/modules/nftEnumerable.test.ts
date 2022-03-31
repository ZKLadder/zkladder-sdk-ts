import { Contract } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../../src/interfaces/address';
import { NftEnumerableReadOnly } from '../../src/modules/nftEnumerable';
import ethersNftEnumerableContractAbstraction from '../mocks/ethersNftEnumerableContractAbstraction';

class NftEnumerableReadOnlyWrapper extends NftEnumerableReadOnly {
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

jest.mock('ethers', () => ({
  utils: {
    keccak256: jest.fn(),
    toUtf8Bytes: jest.fn(),
  },
  BigNumber: {
    from: jest.fn(() => (10)),
  },
}));

jest.mock('../../src/utils/contract/conversions', () => ({
  parseTransactionData: jest.fn(),
  parseMinedTransactionData: jest.fn(),
}));

const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;

describe('NftEnumerable class', () => {
  const nftEnumerableWrapper = new NftEnumerableReadOnlyWrapper(
    '0x12345' as EthereumAddress,
    ethersNftEnumerableContractAbstraction as any,
  );

  test('tokenByIndex correctly calls dependencies and returns response', async () => {
    ethersNftEnumerableContractAbstraction.tokenByIndex.mockResolvedValueOnce({ toNumber: () => ('tokenId') });
    ethersNftEnumerableContractAbstraction.tokenURI.mockResolvedValueOnce('tokenUri');
    ethersNftEnumerableContractAbstraction.ownerOf.mockResolvedValueOnce('0xtokenOwner');

    const result = await nftEnumerableWrapper.tokenByIndex(3);

    expect(ethersNftEnumerableContractAbstraction.tokenByIndex).toHaveBeenCalledWith(3);
    expect(ethersNftEnumerableContractAbstraction.tokenURI).toHaveBeenCalledWith('tokenId');
    expect(ethersNftEnumerableContractAbstraction.ownerOf).toHaveBeenCalledWith('tokenId');

    expect(result).toStrictEqual({
      tokenId: 'tokenId',
      tokenUri: 'tokenUri',
      owner: '0xtokenOwner',
    });
  });

  test('tokenOfOwnerByIndex correctly calls dependencies and returns response', async () => {
    ethersNftEnumerableContractAbstraction.tokenOfOwnerByIndex.mockResolvedValueOnce({ toNumber: () => ('tokenId') });
    ethersNftEnumerableContractAbstraction.tokenURI.mockResolvedValueOnce('tokenUri');

    const result = await nftEnumerableWrapper.tokenOfOwnerByIndex('0xOwner', 3);

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xOwner');
    expect(ethersNftEnumerableContractAbstraction.tokenOfOwnerByIndex).toHaveBeenCalledWith('0xOwner', 3);
    expect(ethersNftEnumerableContractAbstraction.tokenURI).toHaveBeenCalledWith('tokenId');

    expect(result).toStrictEqual({
      tokenId: 'tokenId',
      tokenUri: 'tokenUri',
      owner: '0xOwner',
    });
  });

  test('getAllTokens correctly calls dependencies and returns response', async () => {
    jest.spyOn(nftEnumerableWrapper, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(nftEnumerableWrapper, 'tokenByIndex').mockImplementation(() => (Promise.resolve('token') as any));

    const result = await nftEnumerableWrapper.getAllTokens();

    expect(nftEnumerableWrapper.totalSupply).toHaveBeenCalledTimes(1);
    expect(nftEnumerableWrapper.tokenByIndex).toHaveBeenCalledWith(0);
    expect(nftEnumerableWrapper.tokenByIndex).toHaveBeenCalledWith(1);
    expect(nftEnumerableWrapper.tokenByIndex).toHaveBeenCalledWith(2);
    expect(nftEnumerableWrapper.tokenByIndex).toHaveBeenCalledWith(3);
    expect(nftEnumerableWrapper.tokenByIndex).toHaveBeenCalledWith(4);

    expect(result).toStrictEqual(new Array(5).fill('token'));
  });

  test('getAllTokensOwnedBy correctly calls dependencies and returns response', async () => {
    jest.spyOn(nftEnumerableWrapper, 'balanceOf').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(nftEnumerableWrapper, 'tokenOfOwnerByIndex').mockImplementation(() => (Promise.resolve('tokenOf') as any));

    const result = await nftEnumerableWrapper.getAllTokensOwnedBy('owner');

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('owner');
    expect(nftEnumerableWrapper.balanceOf).toHaveBeenCalledTimes(1);
    expect(nftEnumerableWrapper.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 0);
    expect(nftEnumerableWrapper.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 1);
    expect(nftEnumerableWrapper.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 2);
    expect(nftEnumerableWrapper.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 3);
    expect(nftEnumerableWrapper.tokenOfOwnerByIndex).toHaveBeenCalledWith('owner', 4);

    expect(result).toStrictEqual(new Array(5).fill('tokenOf'));
  });
});
