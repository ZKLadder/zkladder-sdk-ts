import {
  providers, Contract, ContractFactory, Signer, getDefaultProvider, utils,
} from 'ethers';
import contracts from '@zkladder/zkladder-contracts';
import { ERC721Art, ERC721ArtReadOnly } from '../../src/services/erc721Art';
import getNftMintVoucher from '../../src/utils/api/getNftMintVoucher';
import ethersNftLazyMintAbstraction from '../mocks/ethersNftLazyMintAbstraction';
import { EthereumAddress, isEthereumAddress } from '../../src/interfaces/address';
import { parseTransactionData } from '../../src/utils/contract/conversions';
import nftVoucher from '../../src/utils/vouchers/erc721Art';
import { validateInitializerParams } from '../../src/utils/contract/validators';

jest.mock('@zkladder/zkladder-contracts', () => (jest.fn()));
jest.mock('../../src/utils/api/getNftMintVoucher', () => (jest.fn()));
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
  ContractFactory: jest.fn(),
  Signer: { isSigner: jest.fn() },
  BigNumber: { from: jest.fn(() => ('mockBigNumber')) },
  getDefaultProvider: jest.fn(),
  utils: {
    Interface: jest.fn(),
  },
}));
jest.mock('../../src/services/infuraIpfs', () => (jest.fn(() => ({
  addFiles: () => ([{ Hash: 'QMmockcid' }]),
  getGatewayUrl: () => ('https://mockgateway'),
}))));
jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn(),
}));

jest.mock('../../src/utils/contract/conversions', () => ({
  parseMinedTransactionData: jest.fn(),
  parseTransactionData: jest.fn(),
  ethToWei: jest.fn(),
}));

jest.mock('../../src/utils/vouchers/erc721Art', () => (jest.fn()));

jest.mock('axios', () => ({
  get: jest.fn(() => ({ data: { mock: 'metadata' } })),
}));

jest.mock('../../src/utils/contract/validators', () => ({
  validateInitializerParams: jest.fn(),
}));

jest.mock('../../src/constants/networks', () => (jest.fn(() => ({
  name: 'Ethereum',
  currency: 'ETH',
  chainId: 1,
  RPCEndpoint: 'https://mock.mock',
}))));

const mockContracts = contracts as jest.Mocked<any>;
const mockGetNftMintVoucher = getNftMintVoucher as jest.Mocked<any>;
const mockProviders = providers as jest.Mocked<any>;
const mockReadOnlyProvider = getDefaultProvider as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;
const mockSigner = Signer as jest.Mocked<any>;
const mockContractFactory = ContractFactory as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;
const mockParseTransactionData = parseTransactionData as jest.Mocked<any>;
// const mockEthToWei = ethToWei as jest.Mocked<any>;
const mockNftVoucher = nftVoucher as jest.Mocked<any>;
const mockValiateInitializerParams = validateInitializerParams as jest.Mocked<any>;
const mockInterface = utils.Interface as jest.Mocked<any>;

describe('ERC721Factory tests', () => {
  const mockProvider = { send: jest.fn(), getSigner: jest.fn(() => ('mockSigner')) };

  mockProviders.Web3Provider.mockReturnValue(mockProvider);
  mockIsEthereumAddress.mockReturnValue('0x123456789');

  const setupParams = {
    address: '0x123456789',
    infuraIpfsProjectId: 'mockId',
    infuraIpfsProjectSecret: 'mockSecret',
  };

  test('setup correctly calls dependencies when instantiating MemberNftV1 with ethers Wallet', async () => {
    const mockSupportsInterface = jest.spyOn(ERC721Art.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockReturnValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(true);
    const nft = await ERC721Art.setup({ ...setupParams, provider: 'mockProvider' });

    expect(mockContracts).toHaveBeenCalledWith('4');
    expect(mockProviders.Web3Provider).toHaveBeenCalledTimes(0);
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(0);
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', 'mockProvider');
    expect(nft instanceof ERC721Art).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup correctly calls dependencies when instantiating MemberNftV1 with EIP-1193 Provider', async () => {
    const mockSupportsInterface = jest.spyOn(ERC721Art.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockReturnValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(false);
    const nft = await ERC721Art.setup({ ...setupParams, provider: 'mockProvider' });

    expect(mockContracts).toHaveBeenCalledWith('4');
    expect(mockProviders.Web3Provider).toHaveBeenCalledWith('mockProvider');
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(1);
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', 'mockSigner');
    expect(nft instanceof ERC721Art).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup correctly calls dependencies when instantiating MemberNftV1 only chainId', async () => {
    const mockSupportsInterface = jest.spyOn(ERC721Art.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockReturnValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(false);
    mockReadOnlyProvider.mockReturnValueOnce('mockReadOnlyProvider');
    const nft = await ERC721Art.setup({ ...setupParams, chainId: 1 });

    expect(mockReadOnlyProvider).toHaveBeenCalledWith('https://mock.mock');
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', 'mockReadOnlyProvider');
    expect(nft instanceof ERC721ArtReadOnly).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup rethrows errors', async () => {
    const mockSupportsInterface = jest.spyOn(ERC721Art.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockImplementation(() => { throw new Error('Error during contract setup'); });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);

    try {
      await ERC721Art.setup({ ...setupParams, provider: 'mockProvider' });
      expect(true).toBe(false);
    } catch (error:any) {
      expect(error.message).toStrictEqual('Error during contract setup');
    }
    mockSupportsInterface.mockRestore();
  });

  test('deploy function correctly calls dependencies and returns result with ethers Wallet', async () => {
    const collectionData = {
      name: 'ZKLTest',
      symbol: 'MOCK',
      beneficiaryAddress: '0xuser',
      image: 'ipfs://123456789',
      description: 'mockDescription',
      roles: [],
    };

    const infuraIpfs = {
      projectId: 'mockId',
      projectSecret: 'mockSecret',
    };

    const provider = {
      request: jest.fn(() => '0x12345'),
    };

    const encodeFunctionData = jest.fn(() => ('mockInitializer'));
    mockInterface.mockReturnValue({ encodeFunctionData });
    const mockDeploy = jest.fn(() => ({
      address: 'newcontractaddress',
      deployTransaction: 'mockDeployTransaction',
    }));
    mockContracts.mockReturnValue({ abi: 'mockAbi', bytecode: 'mockBytecode', address: '0xmocklogicaddress' });
    mockContractFactory.mockImplementation(() => ({
      deploy: mockDeploy,
    }));
    mockParseTransactionData.mockReturnValue({ mock: 'result' });
    mockSigner.isSigner.mockReturnValueOnce(true);

    const nft = await ERC721Art.deploy({
      provider,
      collectionData,
      infuraIpfs,
    });

    expect(mockContracts).toHaveBeenCalledWith('4');
    expect(provider.request).toHaveBeenCalledWith({
      method: 'eth_getCode',
      params: ['0xmocklogicaddress', 'latest'],
    });
    expect(mockContracts).toHaveBeenCalledWith('2');
    expect(mockContractFactory).toHaveBeenCalledWith('mockAbi', 'mockBytecode', provider);
    expect(mockDeploy).toHaveBeenCalledWith('0xmocklogicaddress', 'mockInitializer');
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(0);
    expect(mockParseTransactionData).toHaveBeenCalledWith('mockDeployTransaction');
    expect(mockValiateInitializerParams).toHaveBeenCalledWith('mockAbi', ['ZKLTest', 'MOCK', 'ipfs://QMmockcid', '0xuser']);
    expect(nft).toStrictEqual({
      address: 'newcontractaddress',
      transaction: { mock: 'result' },
    });
  });

  test('deploy function correctly calls dependencies and returns result with EIP-1193 Provider', async () => {
    const collectionData = {
      name: 'ZKLTest',
      symbol: 'MOCK',
      beneficiaryAddress: '0xuser',
      image: 'ipfs://123456789',
      description: 'mockDescription',
      roles: [],
    };

    const infuraIpfs = {
      projectId: 'mockId',
      projectSecret: 'mockSecret',
    };

    const provider = {
      request: jest.fn(() => '0x12345'),
    };

    const encodeFunctionData = jest.fn(() => ('mockInitializer'));
    mockInterface.mockReturnValue({ encodeFunctionData });

    const mockDeploy = jest.fn(() => ({
      address: 'newcontractaddress',
      deployTransaction: 'mockDeployTransaction',
    }));
    mockContracts.mockReturnValue({ abi: 'mockAbi', bytecode: 'mockBytecode', address: '0xmocklogicaddress' });
    mockContractFactory.mockImplementation(() => ({
      deploy: mockDeploy,
    }));
    mockParseTransactionData.mockReturnValue({ mock: 'result' });
    mockSigner.isSigner.mockReturnValueOnce(false);

    const nft = await ERC721Art.deploy({
      provider,
      collectionData,
      infuraIpfs,
    });

    expect(mockContracts).toHaveBeenCalledWith('4');
    expect(mockContracts).toHaveBeenCalledWith('2');
    expect(provider.request).toHaveBeenCalledWith({
      method: 'eth_getCode',
      params: ['0xmocklogicaddress', 'latest'],
    });
    expect(mockContractFactory).toHaveBeenCalledWith('mockAbi', 'mockBytecode', 'mockSigner');
    expect(mockDeploy).toHaveBeenCalledWith('0xmocklogicaddress', 'mockInitializer');
    expect(mockParseTransactionData).toHaveBeenCalledWith('mockDeployTransaction');
    expect(mockProviders.Web3Provider).toHaveBeenCalledWith(provider);
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(1);
    expect(mockValiateInitializerParams).toHaveBeenCalledWith('mockAbi', ['ZKLTest', 'MOCK', 'ipfs://QMmockcid', '0xuser']);
    expect(nft).toStrictEqual({
      address: 'newcontractaddress',
      transaction: { mock: 'result' },
    });
  });

  test('deploy function throws if no implementation contract deployed', async () => {
    const collectionData = {
      name: 'ZKLTest',
      symbol: 'MOCK',
      beneficiaryAddress: '0xuser',
      image: 'ipfs://123456789',
      description: 'mockDescription',
      roles: [],
    };

    const infuraIpfs = {
      projectId: 'mockId',
      projectSecret: 'mockSecret',
    };

    const provider = {
      request: jest.fn(() => '0x'),
    };

    mockContracts.mockReturnValue({ abi: 'mockAbi', bytecode: 'mockBytecode', address: '0xmocklogicaddress' });

    expect(async () => {
      await ERC721Art.deploy({
        provider,
        collectionData,
        infuraIpfs,
      });
    }).rejects.toThrow(new Error('This contract is not yet available on this blockchain network'));
  });
});

describe('ERC721ArtReadOnly service tests', () => {
  const setupParams = {
    chainId: 1,
    address: '0x123456789',
    infuraIpfsProjectId: 'mockId',
    infuraIpfsProjectSecret: 'mockSecret',
  };

  test('getCollectionMetadata correctly calls dependencies and returns results', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art, 'name').mockImplementationOnce(() => (Promise.resolve('MOCKNAME')));
    jest.spyOn(erc721Art, 'symbol').mockImplementationOnce(() => (Promise.resolve('MOCKSYMBOL')));
    jest.spyOn(erc721Art, 'beneficiaryAddress').mockImplementationOnce(() => (Promise.resolve('0xtokenHolder' as EthereumAddress)));
    jest.spyOn(erc721Art, 'contractUri').mockImplementationOnce(() => (Promise.resolve('https://mockNft.com')));

    const token = await erc721Art.getCollectionMetadata();

    expect(erc721Art.name).toHaveBeenCalledTimes(1);
    expect(erc721Art.symbol).toHaveBeenCalledTimes(1);
    expect(erc721Art.beneficiaryAddress).toHaveBeenCalledTimes(1);
    expect(erc721Art.contractUri).toHaveBeenCalledTimes(1);

    expect(token).toStrictEqual({
      name: 'MOCKNAME',
      symbol: 'MOCKSYMBOL',
      beneficiaryAddress: '0xtokenHolder',
      mock: 'metadata',
    });
  });

  test('getToken correctly calls dependencies and returns results', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art, 'tokenUri').mockImplementationOnce(() => (Promise.resolve('https://mockNft.com')));
    jest.spyOn(erc721Art, 'ownerOf').mockImplementation(() => (Promise.resolve('0xtokenHolder') as any));

    const token = await erc721Art.getToken(123);

    expect(erc721Art.tokenUri).toHaveBeenCalledWith(123);
    expect(erc721Art.ownerOf).toHaveBeenCalledWith(123);

    expect(token).toStrictEqual({
      tokenId: 123,
      tokenUri: 'https://mockNft.com',
      owner: '0xtokenHolder',
      metadata: {
        mock: 'metadata',
      },
    });
  });

  test('getTokenByIndex correctly calls dependencies and returns results', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art, 'tokenByIndex').mockImplementationOnce(() => (Promise.resolve(555)));
    jest.spyOn(erc721Art, 'getToken').mockImplementationOnce(() => (Promise.resolve({
      tokenId: 123,
      tokenUri: 'https://mockNft.com',
      owner: '0xtokenHolder' as EthereumAddress,
      metadata: {
        mock: 'metadata',
      },
    })));

    const token = await erc721Art.getTokenByIndex(123);

    expect(erc721Art.tokenByIndex).toHaveBeenCalledWith(123);
    expect(erc721Art.getToken).toHaveBeenCalledWith(555);

    expect(token).toStrictEqual({
      tokenId: 123,
      tokenUri: 'https://mockNft.com',
      owner: '0xtokenHolder',
      metadata: {
        mock: 'metadata',
      },
    });
  });

  test('getAllTokens correctly calls dependencies and returns results', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(erc721Art, 'getTokenByIndex').mockImplementation(() => (Promise.resolve('token') as any));

    const result = await erc721Art.getAllTokens();

    expect(erc721Art.totalSupply).toHaveBeenCalledTimes(1);
    expect(erc721Art.getTokenByIndex).toHaveBeenCalledWith(0);
    expect(erc721Art.getTokenByIndex).toHaveBeenCalledWith(1);
    expect(erc721Art.getTokenByIndex).toHaveBeenCalledWith(2);
    expect(erc721Art.getTokenByIndex).toHaveBeenCalledWith(3);
    expect(erc721Art.getTokenByIndex).toHaveBeenCalledWith(4);

    expect(result).toStrictEqual(new Array(5).fill('token'));
  });

  test('getTokenOfOwnerByIndex correctly calls dependencies and returns results', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art, 'tokenOfOwnerByIndex').mockImplementationOnce(() => (Promise.resolve(555)));
    jest.spyOn(erc721Art, 'getToken').mockImplementationOnce(() => (Promise.resolve({
      tokenId: 123,
      tokenUri: 'https://mockNft.com',
      owner: '0xtokenHolder' as EthereumAddress,
      tierId: 3,
      metadata: {
        mock: 'metadata',
      },
    })));

    const token = await erc721Art.getTokenOfOwnerByIndex('0x12345', 123);

    expect(erc721Art.tokenOfOwnerByIndex).toHaveBeenCalledWith('0x12345', 123);
    expect(erc721Art.getToken).toHaveBeenCalledWith(555);

    expect(token).toStrictEqual({
      tokenId: 123,
      tokenUri: 'https://mockNft.com',
      owner: '0xtokenHolder',
      tierId: 3,
      metadata: {
        mock: 'metadata',
      },
    });
  });

  test('getAllTokensOwnedBy correctly calls dependencies and returns results', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art, 'balanceOf').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(erc721Art, 'getTokenOfOwnerByIndex').mockImplementation(() => (Promise.resolve('token') as any));

    const result = await erc721Art.getAllTokensOwnedBy('0xmockuser');

    expect(erc721Art.balanceOf).toHaveBeenCalledWith('0xmockuser');
    expect(erc721Art.getTokenOfOwnerByIndex).toHaveBeenCalledWith('0xmockuser', 0);
    expect(erc721Art.getTokenOfOwnerByIndex).toHaveBeenCalledWith('0xmockuser', 1);
    expect(erc721Art.getTokenOfOwnerByIndex).toHaveBeenCalledWith('0xmockuser', 2);
    expect(erc721Art.getTokenOfOwnerByIndex).toHaveBeenCalledWith('0xmockuser', 3);
    expect(erc721Art.getTokenOfOwnerByIndex).toHaveBeenCalledWith('0xmockuser', 4);

    expect(result).toStrictEqual(new Array(5).fill('token'));
  });
});

describe('ERC721Art service tests', () => {
  const setupParams = {
    provider: 'mockProvider',
    address: '0x123456789',
    infuraIpfsProjectId: 'mockId',
    infuraIpfsProjectSecret: 'mockSecret',
  };

  test('getMintVoucher function correctly calls dependencies and returns result', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
    mockGetNftMintVoucher.mockResolvedValue({ mock: 'voucher' });
    const voucher = await erc721Art.getMintVoucher('0xuser12345', 'mockRole');

    expect(mockGetNftMintVoucher).toHaveBeenCalledWith({
      contractAddress: '0x123456789', userAddress: '0xuser12345', chainId: '1', roleId: 'mockRole',
    });
    expect(voucher).toStrictEqual({ mock: 'voucher' });
  });

  test('signMintVoucher function correctly calls dependencies and returns result', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    jest.spyOn(erc721Art as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
    jest.spyOn(erc721Art, 'name').mockImplementationOnce(() => (Promise.resolve('MOCKZKL')));
    jest.spyOn(erc721Art as any, 'getPrimaryAccount').mockImplementationOnce(() => (Promise.resolve(['0x12345'])));
    jest.spyOn(erc721Art, 'signTypedData' as any).mockImplementation(() => ('0xsignedData'));
    jest.spyOn(erc721Art as any, 'onlyRole').mockImplementation(() => (true));
    mockNftVoucher.mockReturnValue({ mock: 'voucher' });

    const result = await erc721Art.signMintVoucher('0xuser123', 2, 'https://mockuri');

    expect(mockNftVoucher).toHaveBeenCalledWith('1', 'MOCKZKL', '0x123456789', 2, '0xuser123', 'https://mockuri');
    expect(result).toStrictEqual({
      minter: '0xuser123', tokenId: 2, tokenUri: 'https://mockuri', signature: '0xsignedData',
    });
  });

  test('mintTo function correctly calls dependencies and returns result', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    const mockMintToWithUri = jest.fn();
    jest.spyOn(erc721Art as any, 'mintToWithUri').mockImplementationOnce(mockMintToWithUri);

    mockMintToWithUri.mockResolvedValue({ mock: 'result' });

    const mintTx = await erc721Art.mintTo('0xuser', 222, { tierId: 3, test: 'metadata' });

    expect((erc721Art as any).mintToWithUri).toHaveBeenCalledWith('0xuser', 222, 'ipfs://QMmockcid');
    expect(mintTx).toStrictEqual({ mock: 'result' });
  });

  test('batchMintTo function correctly calls dependencies and returns result', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    const mockMintToWithUri = jest.fn();
    const mockOnlyRole = jest.fn();
    jest.spyOn(erc721Art as any, 'batchMintToWithUri').mockImplementationOnce(mockMintToWithUri);
    jest.spyOn(erc721Art as any, 'onlyRole').mockImplementationOnce(mockOnlyRole);

    mockMintToWithUri.mockResolvedValue({ mock: 'result' });
    mockIsEthereumAddress.mockReturnValue('0xuser');

    const mintTx = await erc721Art.batchMintTo([
      { to: '0xuser', tokenId: 222, metadata: { tierId: 3, test: 'metadata' } },
    ]);

    expect((erc721Art as any).batchMintToWithUri).toHaveBeenCalledWith([
      { to: '0xuser', tokenId: 222, tokenUri: 'ipfs://QMmockcid' },
    ]);

    expect(mintTx).toStrictEqual({ mock: 'result' });
  });

  test('mint function correctly calls dependencies and returns result', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    (erc721Art as any).contractAbstraction = ethersNftLazyMintAbstraction;

    ethersNftLazyMintAbstraction.salePrice.mockResolvedValueOnce(100000005);
    ethersNftLazyMintAbstraction.mint.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransactionData.mockReturnValueOnce({ parsed: 'transaction' });

    const voucher = {
      mint: 'voucher', minter: 'mockMinter', tokenId: 123,
    } as any;

    const result = await erc721Art.mint(voucher);

    expect(mockParseTransactionData).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('mockMinter');
    expect(ethersNftLazyMintAbstraction.mint).toHaveBeenCalledWith(voucher, { value: 100000005 });
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });

  test('batchMint function correctly calls dependencies and returns result', async () => {
    const erc721Art = await ERC721Art.setup(setupParams);
    (erc721Art as any).contractAbstraction = ethersNftLazyMintAbstraction;

    ethersNftLazyMintAbstraction.salePrice.mockResolvedValueOnce({ mul: () => (25000) });
    ethersNftLazyMintAbstraction.batchMint.mockResolvedValueOnce({ notParsed: 'transaction' });
    mockParseTransactionData.mockReturnValueOnce({ parsed: 'transaction' });

    const voucher = {
      mint: 'voucher', minter: 'mockMinter', tokenId: 123,
    } as any;

    const result = await erc721Art.batchMint([voucher]);

    expect(mockParseTransactionData).toHaveBeenCalledWith({ notParsed: 'transaction' });
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('mockMinter');
    expect(ethersNftLazyMintAbstraction.batchMint).toHaveBeenCalledWith([voucher], { value: 25000 });
    expect(result).toStrictEqual({ parsed: 'transaction' });
  });
});
