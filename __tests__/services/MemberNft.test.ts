import { providers, Contract, ContractFactory } from 'ethers';
import MemberNft from '../../src/services/memberNft';
import getContractABI from '../../src/utils/api/getContractABI';
import getNftMintVoucher from '../../src/utils/api/getNftMintVoucher';
import ethersNftWhitelistedAbstraction from '../mocks/ethersNftWhitelistedAbstraction';
import { EthereumAddress, isEthereumAddress } from '../../src/interfaces/address';
import { parseMinedTransactionData, parseTransactionData } from '../../src/utils/contract/conversions';
import nftVoucher from '../../src/utils/vouchers/nftVoucher';

jest.mock('../../src/utils/api/getContractABI', () => (jest.fn()));
jest.mock('../../src/utils/api/getNftMintVoucher', () => (jest.fn()));
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
  ContractFactory: jest.fn(),
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
}));

jest.mock('../../src/utils/vouchers/nftVoucher', () => (jest.fn()));

jest.mock('axios', () => ({
  get: jest.fn(() => ({ data: { mock: 'metadata' } })),
}));

const setupParams = {
  provider: 'mockProvider',
  address: '0x123456789',
  infuraIpfsProjectId: 'mockId',
  infuraIpfsProjectSecret: 'mockSecret',
};

const mockGetContractAbi = getContractABI as jest.Mocked<any>;
const mockGetNftMintVoucher = getNftMintVoucher as jest.Mocked<any>;
const mockProviders = providers as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;
const mockContractFactory = ContractFactory as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;
const mockParseTransactionData = parseTransactionData as jest.Mocked<any>;
const mockParseMinedTransactionData = parseMinedTransactionData as jest.Mocked<any>;
const mockNftVoucher = nftVoucher as jest.Mocked<any>;

describe('MemberNft service tests', () => {
  mockProviders.Web3Provider.mockReturnValue({ send: jest.fn(), getSigner: () => ('mockSigner') });
  mockIsEthereumAddress.mockReturnValue('0x123456789');
  test('setup correctly calls dependencies when instantiating nft class', async () => {
    const mockSupportsInterface = jest.spyOn(MemberNft.prototype, 'supportsInterface').mockImplementationOnce(() => (Promise.resolve(true)));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi' });
    mockContract.mockReturnValueOnce(ethersNftWhitelistedAbstraction);
    const nft = await MemberNft.setup(setupParams);

    expect(mockProviders.Web3Provider).toHaveBeenCalledWith('mockProvider');
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
      expect(error).toStrictEqual(new Error('Cannot call constructor directly; User MemberNft.setUp function'));
    }
    mockSupportsInterface.mockRestore();
  });

  test('deploy function correctly calls dependencies and returns result', async () => {
    const mockDeploy = jest.fn(() => ({
      address: 'newcontractaddress',
      deployTransaction: 'mockDeployTransaction',
    }));
    mockGetContractAbi.mockResolvedValue({ abi: 'mockAbi', bytecode: 'mockBytecode' });
    mockContractFactory.mockImplementation(() => ({
      deploy: mockDeploy,
    }));
    mockParseTransactionData.mockReturnValue({ mock: 'result' });

    const nft = await MemberNft.deploy({
      provider: 'mockProvider',
      name: 'ZKLTest',
      symbol: 'MOCK',
      baseUri: 'mockUri',
      beneficiary: '0xuser',
    });

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xuser');
    expect(mockGetContractAbi).toHaveBeenCalledWith({ id: '3' });
    expect(mockContractFactory).toHaveBeenCalledWith('mockAbi', 'mockBytecode', 'mockSigner');
    expect(mockDeploy).toHaveBeenCalledWith('ZKLTest', 'MOCK', 'mockUri', '0xuser');
    expect(mockParseTransactionData).toHaveBeenCalledWith('mockDeployTransaction');
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

    mockMintToWithUri.mockResolvedValue({ mock: 'result' });

    const mintTx = await memberNft.mintTo('0xuser', { test: 'metadata' });

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

    const result = await memberNft.mintToAndWait('0xuser', { mock: 'data' });

    expect(memberNft.mintTo).toHaveBeenCalledWith('0xuser', { mock: 'data' });
    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
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
});

test('signMintVoucher function correctly calls dependencies and returns result', async () => {
  const memberNft = await MemberNft.setup(setupParams);
  jest.spyOn(memberNft as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
  jest.spyOn(memberNft, 'name').mockImplementationOnce(() => (Promise.resolve('MOCKZKL')));
  jest.spyOn(memberNft, 'balanceOf').mockImplementationOnce(() => (Promise.resolve(10)));
  jest.spyOn(memberNft as any, 'getPrimaryAccount').mockImplementationOnce(() => (Promise.resolve(['0x12345'])));
  jest.spyOn(memberNft, 'signTypedData' as any).mockImplementation(() => ('0xsignedData'));
  jest.spyOn(memberNft as any, 'onlyRole').mockImplementation(() => (true));
  mockNftVoucher.mockReturnValue({ mock: 'voucher' });

  const result = await memberNft.signMintVoucher('0xuser123', 5);

  expect(mockNftVoucher).toHaveBeenCalledWith('1', 'MOCKZKL', '0x123456789', 15, '0xuser123');
  expect(result).toStrictEqual({ balance: 15, minter: '0xuser123', signature: '0xsignedData' });
});

test('getMintVoucher function correctly calls dependencies and returns result', async () => {
  const memberNft = await MemberNft.setup(setupParams);
  jest.spyOn(memberNft as any, 'getChainId').mockImplementationOnce(() => (Promise.resolve('1')));
  mockGetNftMintVoucher.mockResolvedValue({ mock: 'voucher' });
  const voucher = await memberNft.getMintVoucher('0xuser12345');

  expect(mockGetNftMintVoucher).toHaveBeenCalledWith({ contractAddress: '0x123456789', userAddress: '0xuser12345', chainId: '1' });
  expect(voucher).toStrictEqual({ mock: 'voucher' });
});

test('mint function correctly calls dependencies and returns result', async () => {
  const memberNft = await MemberNft.setup(setupParams);
  jest.spyOn(memberNft, 'totalSupply').mockImplementationOnce(() => (Promise.resolve(5)));
  jest.spyOn(memberNft as any, 'mintWithUri').mockImplementationOnce(() => (Promise.resolve({ mock: 'result' })));

  const voucher = { balance: 15, minter: '0xuser123', signature: '0xsignedData' };
  const mintTx = await memberNft.mint(voucher, { test: 'metadata' });

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

  const voucher = { balance: 15, minter: '0xuser123', signature: '0xsignedData' };
  const result = await memberNft.mintAndWait(voucher, { mock: 'data' });

  expect(memberNft.mint).toHaveBeenCalledWith(voucher, { mock: 'data' });
  expect(wait).toHaveBeenCalledTimes(1);
  expect(result).toEqual({ transaction: 'result' });
});
