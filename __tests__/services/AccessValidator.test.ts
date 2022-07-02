import { providers, Contract, BigNumber } from 'ethers';
import AccessValidator from '../../src/services/accessValidator';
import getNetworkById from '../../src/constants/networks';
import { isEthereumAddress } from '../../src/interfaces/address';
import AccessSchemaBuilder from '../../src/modules/accessSchemaBuilder';

jest.mock('../../src/constants/networks', () => (jest.fn()));

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  providers: {
    JsonRpcProvider: jest.fn(),
  },
  Contract: jest.fn(),
}));

jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn(),
}));

const mockGetNetworkById = getNetworkById as jest.Mocked<any>;
const mockProviders = providers as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;

describe('AccessValidator tests', () => {
  test('validateWhitelistCondition returns correct result', async () => {
    const mockWhitelistCondition = {
      returnValueTest: {
        value: '0x1a34B67c9',
      },
    };

    expect(await (AccessValidator as any).validateWhitelistCondition('0x1A34B67C9', mockWhitelistCondition)).toStrictEqual(true);
    expect(await (AccessValidator as any).validateWhitelistCondition('0x987654321', mockWhitelistCondition)).toStrictEqual(false);
  });

  test('validateBlacklist returns correct result', async () => {
    const mockBlacklistCondition = {
      returnValueTest: {
        value: '0x1a34B67c9',
      },
    };

    expect(await (AccessValidator as any).validateBlacklistCondition('0x1A34B67C9', mockBlacklistCondition)).toStrictEqual(false);
    expect(await (AccessValidator as any).validateBlacklistCondition('0x987654321', mockBlacklistCondition)).toStrictEqual(true);
  });

  test('validateTimelock returns correct result', async () => {
    const greaterThenTimelock = {
      returnValueTest: {
        comparator: '>=',
        value: Date.now() + 10000,
      },
    };

    const lessThenTimelock = {
      returnValueTest: {
        comparator: '<=',
        value: Date.now() + 10000,
      },
    };

    expect(await (AccessValidator as any).validateTimelock('0x1A34B67C9', greaterThenTimelock)).toStrictEqual(false);
    expect(await (AccessValidator as any).validateTimelock('0x987654321', lessThenTimelock)).toStrictEqual(true);
  });

  test('validateRpcCondition returns correct result', async () => {
    const rpcAccessCondition = {
      chainId: 111,
      parameters: ['one', ':userAddress', 'two'],
      method: 'mockRPCMethod',
      returnValueTest: {
        comparator: '>=',
        value: '100',
      },
    };

    const send = jest.fn();
    send.mockResolvedValue(99);
    mockProviders.JsonRpcProvider.mockImplementationOnce(() => ({ send }));

    mockGetNetworkById.mockReturnValue({ RPCEndpoint: 'https://mock.rpc' });

    const result = await (AccessValidator as any).validateRpcCondition('0xmockaddress', rpcAccessCondition);

    expect(mockProviders.JsonRpcProvider).toHaveBeenCalledWith('https://mock.rpc');
    expect(send).toHaveBeenCalledWith('mockRPCMethod', ['one', '0xmockaddress', 'two']);
    expect(result).toStrictEqual(false);
  });

  test('validateContractCondition returns correct result', async () => {
    const contractAccessCondition = {
      chainId: 111,
      parameters: ['one', ':userAddress', 'two'],
      functionName: 'mockContractMethod',
      functionAbi: { mock: 'abi' },
      contractAddress: '0x987654321',
      method: 'mockRPCMethod',
      returnValueTest: {
        comparator: '<=',
        value: '100',
      },
    };

    const contract = { mockContractMethod: jest.fn(() => (BigNumber.from(99))) };
    mockContract.mockReturnValue(contract);
    mockProviders.JsonRpcProvider.mockImplementationOnce(() => ({ mock: 'provider' }));

    mockGetNetworkById.mockReturnValue({ RPCEndpoint: 'https://mock.rpc' });

    const result = await (AccessValidator as any).validateContractCondition('0xmockaddress', contractAccessCondition);

    expect(mockProviders.JsonRpcProvider).toHaveBeenCalledWith('https://mock.rpc');
    expect(mockContract).toHaveBeenCalledWith('0x987654321', { mock: 'abi' }, { mock: 'provider' });
    expect(contract.mockContractMethod).toHaveBeenCalledWith('one', '0xmockaddress', 'two');
    expect(result).toStrictEqual(true);
  });

  test('validate function correctly calls dependencies and returns correct result', async () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn(() => (true));
    (AccessValidator as any).validateWhitelistCondition = jest.fn(() => (true));
    (AccessValidator as any).validateBlacklistCondition = jest.fn(() => (true));
    (AccessValidator as any).validateTimelock = jest.fn(() => (true));
    (AccessValidator as any).validateRpcCondition = jest.fn(() => (true));
    (AccessValidator as any).validateContractCondition = jest.fn(() => (true));

    const accessValidator = new AccessValidator([
      { method: 'whitelist' },
      { operator: 'and' },
      { method: 'blacklist' },
      { operator: 'and' },
      { method: 'timelock' },
      { operator: 'and' },
      { method: 'rpcCall' },
      { operator: 'and' },
      { functionName: 'functionCall' },
    ]);

    mockIsEthereumAddress.mockReturnValue(true);

    const result = await accessValidator.validate('0x123456789');

    expect(result).toStrictEqual(true);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x123456789');
    expect((AccessValidator as any).validateWhitelistCondition).toHaveBeenCalledWith('0x123456789', { method: 'whitelist' });
    expect((AccessValidator as any).validateBlacklistCondition).toHaveBeenCalledWith('0x123456789', { method: 'blacklist' });
    expect((AccessValidator as any).validateTimelock).toHaveBeenCalledWith('0x123456789', { method: 'timelock' });
    expect((AccessValidator as any).validateRpcCondition).toHaveBeenCalledWith('0x123456789', { method: 'rpcCall' });
    expect((AccessValidator as any).validateContractCondition).toHaveBeenCalledWith('0x123456789', { functionName: 'functionCall' });
  });

  test('validate function returns correct result when given or condition', async () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn(() => (true));
    (AccessValidator as any).validateWhitelistCondition = jest.fn(() => (false));
    (AccessValidator as any).validateBlacklistCondition = jest.fn(() => (false));
    (AccessValidator as any).validateTimelock = jest.fn(() => (false));
    (AccessValidator as any).validateRpcCondition = jest.fn(() => (false));
    (AccessValidator as any).validateContractCondition = jest.fn(() => (true));

    const accessValidator = new AccessValidator([
      { method: 'whitelist' },
      { operator: 'or' },
      { method: 'blacklist' },
      { operator: 'or' },
      { method: 'timelock' },
      { operator: 'or' },
      { method: 'rpcCall' },
      { operator: 'or' },
      { functionName: 'functionCall' },
    ]);

    mockIsEthereumAddress.mockReturnValue(true);

    const result = await accessValidator.validate('0x123456789');

    expect(result).toStrictEqual(true);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x123456789');
    expect((AccessValidator as any).validateWhitelistCondition).toHaveBeenCalledWith('0x123456789', { method: 'whitelist' });
    expect((AccessValidator as any).validateBlacklistCondition).toHaveBeenCalledWith('0x123456789', { method: 'blacklist' });
    expect((AccessValidator as any).validateTimelock).toHaveBeenCalledWith('0x123456789', { method: 'timelock' });
    expect((AccessValidator as any).validateRpcCondition).toHaveBeenCalledWith('0x123456789', { method: 'rpcCall' });
    expect((AccessValidator as any).validateContractCondition).toHaveBeenCalledWith('0x123456789', { functionName: 'functionCall' });
  });

  test('validate function returns true when schema is empty', async () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn(() => (true));

    const accessValidator = new AccessValidator([]);

    mockIsEthereumAddress.mockReturnValue(true);

    const result = await accessValidator.validate('0x123456789');

    expect(result).toStrictEqual(true);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x123456789');
  });

  test('validate function returns false when given an invalid address', async () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn(() => (true));

    const accessValidator = new AccessValidator([]);

    mockIsEthereumAddress.mockImplementation(() => { throw new Error('Invalid'); });

    const result = await accessValidator.validate('0x123456789');

    expect(result).toStrictEqual(false);
    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0x123456789');
  });
});
