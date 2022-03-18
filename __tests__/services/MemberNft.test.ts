import {
  providers, Contract, ContractFactory, Signer, BigNumber,
} from 'ethers';
import MemberNft from '../../src/services/memberNft';
import getContractABI from '../../src/utils/api/getContractABI';
import getNftMintVoucher from '../../src/utils/api/getNftMintVoucher';
import ethersNftWhitelistedAbstraction from '../mocks/ethersNftWhitelistedAbstraction';
import { EthereumAddress, isEthereumAddress } from '../../src/interfaces/address';
import { parseMinedTransactionData, parseTransactionData, ethToWei } from '../../src/utils/contract/conversions';
import nftVoucher from '../../src/utils/vouchers/nftVoucher';
import { validateConstructorParams } from '../../src/utils/contract/validators';

jest.mock('../../src/utils/api/getContractABI', () => (jest.fn()));
jest.mock('../../src/utils/api/getNftMintVoucher', () => (jest.fn()));
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
  ContractFactory: jest.fn(),
  Signer: { isSigner: jest.fn() },
  BigNumber: { from: jest.fn(() => ('mockBigNumber')) },
}));
jest.mock('../../src/modules/infuraIpfs', () => (jest.fn(() => ({
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

jest.mock('../../src/utils/vouchers/nftVoucher', () => (jest.fn()));

jest.mock('axios', () => ({
  get: jest.fn(() => ({ data: { mock: 'metadata' } })),
}));

jest.mock('../../src/utils/contract/validators', () => ({
  validateConstructorParams: jest.fn(),
}));

const mockGetContractAbi = getContractABI as jest.Mocked<any>;
const mockGetNftMintVoucher = getNftMintVoucher as jest.Mocked<any>;
const mockProviders = providers as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;
const mockSigner = Signer as jest.Mocked<any>;
const mockContractFactory = ContractFactory as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;
const mockParseTransactionData = parseTransactionData as jest.Mocked<any>;
const mockParseMinedTransactionData = parseMinedTransactionData as jest.Mocked<any>;
const mockEthToWei = ethToWei as jest.Mocked<any>;
const mockNftVoucher = nftVoucher as jest.Mocked<any>;
const mockValidateConstructorParams = validateConstructorParams as jest.Mocked<any>;

describe('MemberNft service tests', () => {
  const mockProvider = { send: jest.fn(), getSigner: jest.fn(() => ('mockSigner')) };

  mockProviders.Web3Provider.mockReturnValue(mockProvider);
  mockIsEthereumAddress.mockReturnValue('0x123456789');

  const setupParams = {
    provider: { provider: mockProvider },
    address: '0x123456789',
    infuraIpfsProjectId: 'mockId',
    infuraIpfsProjectSecret: 'mockSecret',
  };

  test('setup correctly calls dependencies when instantiating MemberNft with ethers Wallet', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftWhitelistedAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(true);
    const nft = await MemberNft.setup(setupParams);

    expect(mockProviders.Web3Provider).toHaveBeenCalledTimes(0);
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(0);
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', { provider: mockProvider });
    expect(nft instanceof MemberNft).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup correctly calls dependencies when instantiating MemberNft with EIP-1193 Provider', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftWhitelistedAbstraction);
    mockSigner.isSigner.mockReturnValueOnce(false);
    const nft = await MemberNft.setup(setupParams);

    expect(mockProviders.Web3Provider).toHaveBeenCalledWith({ provider: mockProvider });
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(1);
    expect(mockContract).toHaveBeenCalledWith('0x123456789', 'mockAbi', 'mockSigner');
    expect(nft instanceof MemberNft).toBe(true);
    mockSupportsInterface.mockRestore();
  });

  test('setup rethrows API errors', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockRejectedValueOnce('The ZKL API is not operational');
    mockContract.mockReturnValueOnce(ethersNftWhitelistedAbstraction);

    try {
      await MemberNft.setup(setupParams);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual('The ZKL API is not operational');
    }
    mockSupportsInterface.mockRestore();
  });

  test('direct instantiation throws an error', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi', bytecode: 'mockBytecode' });
    mockContract.mockReturnValueOnce(ethersNftWhitelistedAbstraction);

    try {
      const nft = new MemberNft('guard?', {
        provider: 'mockProvider',
        address: '0x123456789',
        infuraIpfsProjectId: 'mockId',
        infuraIpfsProjectSecret: 'mockSecret',
      });
      expect(nft instanceof MemberNft).toBe(true);
    } catch (error) {
      expect(error).toStrictEqual(new Error('Cannot call constructor directly; Use MemberNft.setUp function'));
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

    const mockDeploy = jest.fn(() => ({
      address: 'newcontractaddress',
      deployTransaction: 'mockDeployTransaction',
    }));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi', bytecode: 'mockBytecode' });
    mockContractFactory.mockImplementation(() => ({
      deploy: mockDeploy,
    }));
    mockParseTransactionData.mockReturnValue({ mock: 'result' });
    mockSigner.isSigner.mockReturnValueOnce(true);

    const nft = await MemberNft.deploy({
      provider: 'mockProvider',
      collectionData,
      infuraIpfs,
    });

    expect(mockGetContractAbi).toHaveBeenCalledWith({ id: '3' });
    expect(mockContractFactory).toHaveBeenCalledWith('mockAbi', 'mockBytecode', 'mockProvider');
    expect(mockDeploy).toHaveBeenCalledWith('ZKLTest', 'MOCK', 'ipfs://QMmockcid', '0xuser');
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(0);
    expect(mockParseTransactionData).toHaveBeenCalledWith('mockDeployTransaction');
    expect(mockValidateConstructorParams).toHaveBeenCalledWith('mockAbi', ['ZKLTest', 'MOCK', 'ipfs://QMmockcid', '0xuser']);
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
    const mockDeploy = jest.fn(() => ({
      address: 'newcontractaddress',
      deployTransaction: 'mockDeployTransaction',
    }));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi', bytecode: 'mockBytecode' });
    mockContractFactory.mockImplementation(() => ({
      deploy: mockDeploy,
    }));
    mockParseTransactionData.mockReturnValue({ mock: 'result' });
    mockSigner.isSigner.mockReturnValueOnce(false);

    const nft = await MemberNft.deploy({
      provider: 'mockProvider',
      collectionData,
      infuraIpfs,
    });

    expect(mockGetContractAbi).toHaveBeenCalledWith({ id: '3' });
    expect(mockContractFactory).toHaveBeenCalledWith('mockAbi', 'mockBytecode', 'mockSigner');
    expect(mockDeploy).toHaveBeenCalledWith('ZKLTest', 'MOCK', 'ipfs://QMmockcid', '0xuser');
    expect(mockParseTransactionData).toHaveBeenCalledWith('mockDeployTransaction');
    expect(mockProviders.Web3Provider).toHaveBeenCalledWith('mockProvider');
    expect(mockProvider.getSigner).toHaveBeenCalledTimes(1);
    expect(mockValidateConstructorParams).toHaveBeenCalledWith('mockAbi', ['ZKLTest', 'MOCK', 'ipfs://QMmockcid', '0xuser']);
    expect(nft).toStrictEqual({
      address: 'newcontractaddress',
      transaction: { mock: 'result' },
    });
  });

  test('mintTo function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    const mockMintToWithUri = jest.fn();
    jest.spyOn(memberNft as any, 'totalSupply').mockImplementationOnce(() => (5));
    jest.spyOn(memberNft as any, 'mintToWithUri').mockImplementationOnce(mockMintToWithUri);
    jest.spyOn(memberNft as any, 'getRoleData').mockImplementationOnce(jest.fn());

    mockMintToWithUri.mockResolvedValue({ mock: 'result' });

    const mintTx = await memberNft.mintTo('0xuser', { roleId: 'mockRole', test: 'metadata' });

    expect((memberNft as any).getRoleData).toHaveBeenCalledWith('mockRole');
    expect((memberNft as any).totalSupply).toHaveBeenCalledTimes(1);
    expect((memberNft as any).mintToWithUri).toHaveBeenCalledWith('0xuser', 'ipfs://QMmockcid');
    expect(mintTx).toStrictEqual({ mock: 'result' });
  });

  test('mintToAndWait function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(memberNft, 'mintTo').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransactionData.mockReturnValueOnce({ transaction: 'result' });

    const result = await memberNft.mintToAndWait('0xuser', { roleId: 'mockRole', mock: 'data' });

    expect(memberNft.mintTo).toHaveBeenCalledWith('0xuser', { roleId: 'mockRole', mock: 'data' });
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('getRoleData correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    jest.spyOn(memberNft, 'getCollectionMetadata').mockImplementationOnce(() => (Promise.resolve({
      name: 'test',
      symbol: 'test',
      beneficiaryAddress: 'test',
      roles: [
        {
          id: 'role1', name: 'role1', price: 123, description: '',
        },
        {
          id: 'role2', name: 'role2', price: 101, description: '',
        },
        {
          id: 'role3', name: 'role3', price: 321, description: '',
        },
      ],
    })));

    const role = await memberNft.getRoleData('role2');

    expect(memberNft.getCollectionMetadata).toHaveBeenCalledTimes(1);

    expect(role).toStrictEqual({
      id: 'role2', name: 'role2', price: 101, description: '',
    });
  });

  test('getRoleData throws when role does not exist', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    jest.spyOn(memberNft, 'getCollectionMetadata').mockImplementationOnce(() => (Promise.resolve({
      name: 'test',
      symbol: 'test',
      beneficiaryAddress: 'test',
      roles: [
        {
          id: 'role1', name: 'role1', price: 123, description: '',
        },
        {
          id: 'role2', name: 'role2', price: 101, description: '',
        },
        {
          id: 'role3', name: 'role3', price: 321, description: '',
        },
      ],
    })));

    await expect(memberNft.getRoleData('fake role')).rejects.toThrow(new Error('Role with id: fake role not found in contract config'));
  });

  test('getCollectionMetadata correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNft.setup(setupParams);
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

  test('getToken correctly calls dependencies and returns results', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    jest.spyOn(memberNft, 'tokenUri').mockImplementationOnce(() => (Promise.resolve('https://mockNft.com')));
    jest.spyOn(memberNft, 'ownerOf').mockImplementation(() => (Promise.resolve('0xtokenHolder') as any));

    const token = await memberNft.getToken(123);

    expect(memberNft.tokenUri).toHaveBeenCalledWith(123);
    expect(memberNft.ownerOf).toHaveBeenCalledWith(123);

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
    const memberNft = await MemberNft.setup(setupParams);
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
    const memberNft = await MemberNft.setup(setupParams);
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

  test('signMintVoucher function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    jest.spyOn(memberNft as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
    jest.spyOn(memberNft, 'name').mockImplementationOnce(() => (Promise.resolve('MOCKZKL')));
    jest.spyOn(memberNft, 'getRoleData').mockImplementationOnce(() => (Promise.resolve({
      id: 'mockRole', name: 'mockRole', description: '', price: 100,
    })));
    mockEthToWei.mockReturnValueOnce(BigNumber.from(100000000));
    jest.spyOn(memberNft, 'balanceOf').mockImplementationOnce(() => (Promise.resolve(10)));
    jest.spyOn(memberNft as any, 'getPrimaryAccount').mockImplementationOnce(() => (Promise.resolve(['0x12345'])));
    jest.spyOn(memberNft, 'signTypedData' as any).mockImplementation(() => ('0xsignedData'));
    jest.spyOn(memberNft as any, 'onlyRole').mockImplementation(() => (true));
    mockNftVoucher.mockReturnValue({ mock: 'voucher' });

    const result = await memberNft.signMintVoucher('0xuser123', 5, 'mockRole');

    expect(mockNftVoucher).toHaveBeenCalledWith('1', 'MOCKZKL', '0x123456789', 15, BigNumber.from(100000000), '0xuser123');
    expect(result).toStrictEqual({
      balance: 15, minter: '0xuser123', salePrice: BigNumber.from(100000000), signature: '0xsignedData',
    });
  });

  test('getMintVoucher function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    jest.spyOn(memberNft as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
    mockGetNftMintVoucher.mockResolvedValue({ mock: 'voucher' });
    const voucher = await memberNft.getMintVoucher('0xuser12345', 'mockRole');

    expect(mockGetNftMintVoucher).toHaveBeenCalledWith({
      contractAddress: '0x123456789', userAddress: '0xuser12345', chainId: '1', roleId: 'mockRole',
    });
    expect(voucher).toStrictEqual({ mock: 'voucher' });
  });

  test('mint function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    jest.spyOn(memberNft, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
    jest.spyOn(memberNft as any, 'mintWithUri').mockImplementationOnce(() => (Promise.resolve({ mock: 'result' })));
    jest.spyOn(memberNft as any, 'getRoleData').mockImplementationOnce(jest.fn());

    const voucher = {
      balance: 15, minter: '0xuser123', signature: '0xsignedData', salePrice: BigNumber.from(100),
    };
    const mintTx = await memberNft.mint(voucher, { roleId: 'mockRole', test: 'metadata' });

    expect((memberNft as any).getRoleData).toHaveBeenCalledWith('mockRole');
    expect((memberNft as any).totalSupply).toHaveBeenCalledTimes(1);
    expect((memberNft as any).mintWithUri).toHaveBeenCalledWith(voucher, 'ipfs://QMmockcid');
    expect(mintTx).toStrictEqual({ mock: 'result' });
  });

  test('mintAndWait function correctly calls dependencies and returns result', async () => {
    const memberNft = await MemberNft.setup(setupParams);
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(memberNft, 'mint').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransactionData.mockReturnValueOnce({ transaction: 'result' });

    const voucher = {
      balance: 15, minter: '0xuser123', salePrice: BigNumber.from(101), signature: '0xsignedData',
    };
    const result = await memberNft.mintAndWait(voucher, { roleId: 'mockRole', mock: 'data' });

    expect(memberNft.mint).toHaveBeenCalledWith(voucher, { roleId: 'mockRole', mock: 'data' });
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });
});
