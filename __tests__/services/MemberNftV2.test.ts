import {
  providers, Contract, ContractFactory, Signer, getDefaultProvider, utils,
} from 'ethers';
import contracts from '@zkladder/zkladder-contracts';
import { MemberNftV2, MemberNftV2ReadOnly } from '../../src/services/memberNftV2';
import getNftMintVoucher from '../../src/utils/api/getNftMintVoucher';
import ethersNftLazyMintAbstraction from '../mocks/ethersNftLazyMintAbstraction';
import { EthereumAddress, isEthereumAddress } from '../../src/interfaces/address';
import { parseTransactionData, ethToWei } from '../../src/utils/contract/conversions';
import nftVoucher from '../../src/utils/vouchers/memberNftV2';
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

jest.mock('../../src/utils/vouchers/memberNftV2', () => (jest.fn()));

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
const mockEthToWei = ethToWei as jest.Mocked<any>;
const mockNftVoucher = nftVoucher as jest.Mocked<any>;
const mockValiateInitializerParams = validateInitializerParams as jest.Mocked<any>;
const mockInterface = utils.Interface as jest.Mocked<any>;

describe('MemberNftV1Factory tests', () => {
  const mockProvider = { send: jest.fn(), getSigner: jest.fn(() => ('mockSigner')) };

  mockProviders.Web3Provider.mockReturnValue(mockProvider);
  mockIsEthereumAddress.mockReturnValue('0x123456789');

  const setupParams = {
    address: '0x123456789',
    infuraIpfsProjectId: 'mockId',
    infuraIpfsProjectSecret: 'mockSecret',
  };

  test('setup correctly calls dependencies when instantiating MemberNftV1 with ethers Wallet', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNftV2.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockReturnValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(true);
    const nft = await MemberNftV2.setup({ ...setupParams, provider: 'mockProvider' });

    expect(mockContracts).toHaveBeenCalledWith('3');
    expect(mockProviders.Web3Provider).toHaveBeenCalledTimes(0);
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(0);
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', 'mockProvider');
    expect(nft instanceof MemberNftV2).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup correctly calls dependencies when instantiating MemberNftV1 with EIP-1193 Provider', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNftV2.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockReturnValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(false);
    const nft = await MemberNftV2.setup({ ...setupParams, provider: 'mockProvider' });

    expect(mockContracts).toHaveBeenCalledWith('3');
    expect(mockProviders.Web3Provider).toHaveBeenCalledWith('mockProvider');
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(1);
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', 'mockSigner');
    expect(nft instanceof MemberNftV2).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup correctly calls dependencies when instantiating MemberNftV1 only chainId', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNftV2.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockReturnValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(false);
    mockReadOnlyProvider.mockReturnValueOnce('mockReadOnlyProvider');
    const nft = await MemberNftV2.setup({ ...setupParams, chainId: 1 });

    expect(mockReadOnlyProvider).toHaveBeenCalledWith('https://mock.mock');
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', 'mockReadOnlyProvider');
    expect(nft instanceof MemberNftV2ReadOnly).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup rethrows errors', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNftV2.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockContracts.mockImplementation(() => { throw new Error('Error during contract setup'); });
    mockContract.mockReturnValueOnce(ethersNftLazyMintAbstraction);

    try {
      await MemberNftV2.setup({ ...setupParams, provider: 'mockProvider' });
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

    const nft = await MemberNftV2.deploy({
      provider,
      collectionData,
      infuraIpfs,
    });

    expect(mockContracts).toHaveBeenCalledWith('3');
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

    const nft = await MemberNftV2.deploy({
      provider,
      collectionData,
      infuraIpfs,
    });

    expect(mockContracts).toHaveBeenCalledWith('3');
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
      await MemberNftV2.deploy({
        provider,
        collectionData,
        infuraIpfs,
      });
    }).rejects.toThrow(new Error('This contract is not yet available on this blockchain network'));
  });
});

describe('MemberNftV1ReadOnly service tests', () => {
  const setupParams = {
    chainId: 1,
    address: '0x123456789',
    infuraIpfsProjectId: 'mockId',
    infuraIpfsProjectSecret: 'mockSecret',
  };

  test('getCollectionMetadata correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'name').mockImplementationOnce(() => (Promise.resolve('MOCKNAME')));
    jest.spyOn(memberNft, 'symbol').mockImplementationOnce(() => (Promise.resolve('MOCKSYMBOL')));
    jest.spyOn(memberNft, 'beneficiaryAddress').mockImplementationOnce(() => (Promise.resolve('0xtokenHolder' as EthereumAddress)));
    jest.spyOn(memberNft, 'contractUri').mockImplementationOnce(() => (Promise.resolve('https://mockNft.com')));

    const token = await memberNft.getCollectionMetadata();

    expect(memberNft.name).toHaveBeenCalledTimes(1);
    expect(memberNft.symbol).toHaveBeenCalledTimes(1);
    expect(memberNft.beneficiaryAddress).toHaveBeenCalledTimes(1);
    expect(memberNft.contractUri).toHaveBeenCalledTimes(1);

    expect(token).toStrictEqual({
      name: 'MOCKNAME',
      symbol: 'MOCKSYMBOL',
      beneficiaryAddress: '0xtokenHolder',
      mock: 'metadata',
    });
  });

  test('getTier correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'tierInfo').mockImplementationOnce(() => (Promise.resolve({
      tierURI: 'mockTierURI',
      salePrice: 100,
      isTransferable: false,
      royaltyBasis: 100,
    })));

    const tierInfo = await memberNft.getTier(123);

    expect(memberNft.tierInfo).toHaveBeenCalledWith(123);

    expect(tierInfo).toStrictEqual({
      tierId: 123,
      tierURI: 'mockTierURI',
      salePrice: 100,
      isTransferable: false,
      royaltyBasis: 100,
      mock: 'metadata',
    });
  });

  test('getTiers correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'totalTiers').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(memberNft, 'getTier').mockImplementation((id) => (Promise.resolve({
      tierId: id,
    } as any)));

    const tiers = await memberNft.getTiers();

    expect(memberNft.totalTiers).toHaveBeenCalledTimes(1);
    expect(memberNft.getTier).toHaveBeenCalledWith(0);
    expect(memberNft.getTier).toHaveBeenCalledWith(1);
    expect(memberNft.getTier).toHaveBeenCalledWith(2);
    expect(memberNft.getTier).toHaveBeenCalledWith(3);
    expect(memberNft.getTier).toHaveBeenCalledWith(4);

    expect(tiers).toStrictEqual([
      { tierId: 0 },
      { tierId: 1 },
      { tierId: 2 },
      { tierId: 3 },
      { tierId: 4 },
    ]);
  });

  test('getToken correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'tokenUri').mockImplementationOnce(() => (Promise.resolve('https://mockNft.com')));
    jest.spyOn(memberNft, 'ownerOf').mockImplementation(() => (Promise.resolve('0xtokenHolder') as any));
    jest.spyOn(memberNft, 'tokenTiers').mockImplementation(() => (Promise.resolve(3) as any));

    const token = await memberNft.getToken(123);

    expect(memberNft.tokenUri).toHaveBeenCalledWith(123);
    expect(memberNft.ownerOf).toHaveBeenCalledWith(123);

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

  test('getAllTokens correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(memberNft, 'getToken').mockImplementation(() => (Promise.resolve('token') as any));

    const result = await memberNft.getAllTokens();

    expect(memberNft.totalSupply).toHaveBeenCalledTimes(1);
    expect(memberNft.getToken).toHaveBeenCalledWith(0);
    expect(memberNft.getToken).toHaveBeenCalledWith(1);
    expect(memberNft.getToken).toHaveBeenCalledWith(2);
    expect(memberNft.getToken).toHaveBeenCalledWith(3);
    expect(memberNft.getToken).toHaveBeenCalledWith(4);

    expect(result).toStrictEqual(new Array(5).fill('token'));
  });

  test('getAllTokensOwnedBy correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'getAllTokens').mockImplementationOnce(() => (Promise.resolve([
      {
        tokenId: 1, owner: '0xuser' as EthereumAddress, tokenUri: '1', metadata: {},
      },
      {
        tokenId: 2, owner: '0xadmin' as EthereumAddress, tokenUri: '1', metadata: {},
      },
      {
        tokenId: 3, owner: '0xuser' as EthereumAddress, tokenUri: '1', metadata: {},
      },
    ])));

    const result = await memberNft.getAllTokensOwnedBy('0xuser');

    expect(memberNft.getAllTokens).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual([{
      tokenId: 1, owner: '0xuser' as EthereumAddress, tokenUri: '1', metadata: {},
    },
    {
      tokenId: 3, owner: '0xuser' as EthereumAddress, tokenUri: '1', metadata: {},
    }]);
  });
});

describe('MemberNftV1 service tests', () => {
  const setupParams = {
    provider: 'mockProvider',
    address: '0x123456789',
    infuraIpfsProjectId: 'mockId',
    infuraIpfsProjectSecret: 'mockSecret',
  };

  test('getMintVoucher function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
    mockGetNftMintVoucher.mockResolvedValue({ mock: 'voucher' });
    const voucher = await memberNft.getMintVoucher('0xuser12345', 'mockRole');

    expect(mockGetNftMintVoucher).toHaveBeenCalledWith({
      contractAddress: '0x123456789', userAddress: '0xuser12345', chainId: '1', roleId: 'mockRole',
    });
    expect(voucher).toStrictEqual({ mock: 'voucher' });
  });

  test('signMintVoucher function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
    jest.spyOn(memberNft, 'name').mockImplementationOnce(() => (Promise.resolve('MOCKZKL')));
    jest.spyOn(memberNft, 'tierInfo').mockImplementationOnce(() => (null as any));
    jest.spyOn(memberNft, 'balanceOf').mockImplementationOnce(() => (Promise.resolve(10)));
    jest.spyOn(memberNft as any, 'getPrimaryAccount').mockImplementationOnce(() => (Promise.resolve(['0x12345'])));
    jest.spyOn(memberNft, 'signTypedData' as any).mockImplementation(() => ('0xsignedData'));
    jest.spyOn(memberNft as any, 'onlyRole').mockImplementation(() => (true));
    mockNftVoucher.mockReturnValue({ mock: 'voucher' });

    const result = await memberNft.signMintVoucher('0xuser123', 5, 2);

    expect(mockNftVoucher).toHaveBeenCalledWith('1', 'MOCKZKL', '0x123456789', 15, 2, '0xuser123');
    expect(result).toStrictEqual({
      balance: 15, minter: '0xuser123', tierId: 2, signature: '0xsignedData',
    });
  });

  test('addTiers function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'addTiersWithUri').mockImplementationOnce(() => (Promise.resolve('tx' as any)));
    mockEthToWei.mockReturnValue('mockBigNumber');

    const result = await memberNft.addTiers([
      {
        tierId: 1, name: 'one', description: 'one', image: 'one', salePrice: 100, isTransferable: false, royaltyBasis: 100,
      },
      {
        tierId: 2, name: 'two', description: 'two', image: 'two', salePrice: 200, isTransferable: true, royaltyBasis: 200,
      },
      {
        tierId: 3, name: 'three', description: 'three', image: 'three', salePrice: 300, isTransferable: false, royaltyBasis: 300,
      },
    ]);

    expect(result).toStrictEqual('tx');
    expect(memberNft.addTiersWithUri).toHaveBeenCalledWith([{
      tierURI: 'ipfs://QMmockcid',
      salePrice: 'mockBigNumber',
      isTransferable: false,
      royaltyBasis: 100,
    },
    {
      tierURI: 'ipfs://QMmockcid',
      salePrice: 'mockBigNumber',
      isTransferable: true,
      royaltyBasis: 200,
    },
    {
      tierURI: 'ipfs://QMmockcid',
      salePrice: 'mockBigNumber',
      isTransferable: false,
      royaltyBasis: 300,
    }]);
  });

  test('updateTiers function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'updateTiersWithUri').mockImplementationOnce(() => (Promise.resolve('tx' as any)));
    mockEthToWei.mockReturnValue('mockBigNumber');

    const result = await memberNft.updateTiers([
      {
        tierId: 1,
        tierUpdates: {
          tierId: 1, name: 'one', description: 'one', image: 'one', salePrice: 100, isTransferable: false, royaltyBasis: 100,
        },
      },
      {
        tierId: 2,
        tierUpdates: {
          tierId: 2, name: 'two', description: 'two', image: 'two', salePrice: 200, isTransferable: true, royaltyBasis: 200,
        },
      },
      {
        tierId: 3,
        tierUpdates: {
          tierId: 3, name: 'three', description: 'three', image: 'three', salePrice: 300, isTransferable: false, royaltyBasis: 300,
        },
      },
    ]);

    expect(result).toStrictEqual('tx');
    expect(memberNft.updateTiersWithUri).toHaveBeenCalledWith([{
      tierId: 1,
      tierUpdates: {
        tierURI: 'ipfs://QMmockcid',
        salePrice: 'mockBigNumber',
        isTransferable: false,
        royaltyBasis: 100,
      },
    },
    {
      tierId: 2,
      tierUpdates: {
        tierURI: 'ipfs://QMmockcid',
        salePrice: 'mockBigNumber',
        isTransferable: true,
        royaltyBasis: 200,
      },
    },
    {
      tierId: 3,
      tierUpdates: {
        tierURI: 'ipfs://QMmockcid',
        salePrice: 'mockBigNumber',
        isTransferable: false,
        royaltyBasis: 300,
      },
    }]);
  });

  test('mintTo function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    const mockMintToWithUri = jest.fn();
    jest.spyOn(memberNft as any, 'totalSupply').mockImplementationOnce(() => (5));
    jest.spyOn(memberNft as any, 'mintToWithUri').mockImplementationOnce(mockMintToWithUri);
    jest.spyOn(memberNft, 'getTier').mockImplementationOnce(() => (Promise.resolve({ name: 'a tier' } as any)));

    mockMintToWithUri.mockResolvedValue({ mock: 'result' });

    const mintTx = await memberNft.mintTo('0xuser', { tierId: 3, test: 'metadata' });

    expect((memberNft as any).getTier).toHaveBeenCalledWith(3);
    expect((memberNft as any).totalSupply).toHaveBeenCalledTimes(1);
    expect((memberNft as any).mintToWithUri).toHaveBeenCalledWith('0xuser', 3, 'ipfs://QMmockcid');
    expect(mintTx).toStrictEqual({ mock: 'result' });
  });

  test('mint function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNftV2.setup(setupParams);
    jest.spyOn(memberNft, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(memberNft as any, 'mintWithUri').mockImplementationOnce(() => (Promise.resolve({ mock: 'result' })));
    jest.spyOn(memberNft, 'getTier').mockImplementationOnce(() => (Promise.resolve({ name: 'a tier' } as any)));

    const voucher = {
      balance: 15, minter: '0xuser123', signature: '0xsignedData', tierId: 2,
    };
    const mintTx = await memberNft.mint(voucher, { tierId: 2, test: 'metadata' });

    expect((memberNft as any).getTier).toHaveBeenCalledWith(2);
    expect((memberNft as any).totalSupply).toHaveBeenCalledTimes(1);
    expect((memberNft as any).mintWithUri).toHaveBeenCalledWith(voucher, 'ipfs://QMmockcid');
    expect(mintTx).toStrictEqual({ mock: 'result' });
  });
});
