import { utils } from 'ethers';
import AccessSchemaBuilder from '../../src/modules/accessSchemaBuilder';
import { ethToWei } from '../../src/utils/contract/conversions';
import { isEthereumAddress } from '../../src/interfaces/address';

jest.mock('../../src/utils/contract/conversions', () => ({
  ethToWei: jest.fn(),
}));

jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn(),
}));

jest.mock('ethers', () => ({
  utils: {
    parseUnits: jest.fn(),
  },
}));

const mockEthToWei = ethToWei as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;
const mockParseUnits = utils.parseUnits as jest.Mocked<any>;

describe('AccessSchemaBuilder class', () => {
  test('validateAccessCondition correctly returns result', () => {
    expect(() => { (AccessSchemaBuilder as any).validateAccessCondition({}); }).toThrow(new Error('Schema has incorrectly formatted contract address'));

    expect(() => { (AccessSchemaBuilder as any).validateAccessCondition({ contractAddress: '12345' }); }).toThrow(new Error('Schema has incorrectly formatted chainId'));

    expect(() => {
      (AccessSchemaBuilder as any).validateAccessCondition({
        contractAddress: '12345',
        chainId: 31337,
      });
    }).toThrow(new Error('Schema has incorrectly formatted returnValueTest'));

    expect(() => {
      (AccessSchemaBuilder as any).validateAccessCondition({
        contractAddress: '12345',
        chainId: 31337,
        returnValueTest: {},
      });
    }).toThrow(new Error('Schema is missing function or method params'));

    expect(() => {
      (AccessSchemaBuilder as any).validateAccessCondition({
        contractAddress: '12345',
        chainId: 31337,
        returnValueTest: {},
        parameters: [],
      });
    }).toThrow(new Error('Schema is missing function or method name'));

    expect(() => {
      (AccessSchemaBuilder as any).validateAccessCondition({
        contractAddress: '12345',
        chainId: 31337,
        returnValueTest: {},
        parameters: [],
        functionName: 'mockFunction',
      });
    }).toThrow(new Error('Schema has incorrectly formatted functionAbi'));

    expect((AccessSchemaBuilder as any).validateAccessCondition({
      contractAddress: '12345',
      chainId: 31337,
      returnValueTest: {},
      parameters: [],
      functionName: 'mockFunction',
      functionAbi: [],
    })).toStrictEqual(true);

    expect((AccessSchemaBuilder as any).validateAccessCondition({
      contractAddress: '12345',
      chainId: 31337,
      returnValueTest: {},
      parameters: [],
      functionName: 'mockFunction',
      functionAbi: [],
    })).toStrictEqual(true);
  });

  test('Constructor creates instance', () => {
    const schemaBuilder = new AccessSchemaBuilder();
    expect(schemaBuilder instanceof AccessSchemaBuilder).toStrictEqual(true);
    expect(schemaBuilder.getAccessSchema()).toStrictEqual([]);
  });

  test('Constructor creates instance', () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn().mockReturnValue(true);
    const mockAccessSchema = [
      { schema: 1 },
      { schema: 2 },
      { schema: 3 },
      { schema: 4 },
    ];
    const schemaBuilder = new AccessSchemaBuilder(mockAccessSchema);
    expect(schemaBuilder instanceof AccessSchemaBuilder).toStrictEqual(true);
    expect(schemaBuilder.getAccessSchema()).toStrictEqual(mockAccessSchema);
    expect((AccessSchemaBuilder as any).validateAccessCondition).toHaveBeenCalledWith({ schema: 1 });
    expect((AccessSchemaBuilder as any).validateAccessCondition).toHaveBeenCalledWith({ schema: 2 });
    expect((AccessSchemaBuilder as any).validateAccessCondition).toHaveBeenCalledWith({ schema: 3 });
    expect((AccessSchemaBuilder as any).validateAccessCondition).toHaveBeenCalledWith({ schema: 4 });
  });

  test('Constructor rethrows validation errors', () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn().mockImplementation(() => {
      throw new Error('A mock validation error');
    });

    const mockAccessSchema = [
      { schema: 1 },
      { schema: 2 },
      { schema: 3 },
      { schema: 4 },
    ];

    expect(() => {
      /* eslint-disable no-new */
      new AccessSchemaBuilder(mockAccessSchema);
    }).toThrow(new Error('A mock validation error'));
  });

  test('formatAccessOperator correctly calls dependencies and returns result', () => {
    expect(AccessSchemaBuilder.formatAccessOperator('and')).toStrictEqual({ operator: 'and' });
    expect(AccessSchemaBuilder.formatAccessOperator('or')).toStrictEqual({ operator: 'or' });
    expect(() => {
      AccessSchemaBuilder.formatAccessOperator('something else');
    }).toThrow(new Error('Invalid operator'));
  });

  test('formatHasBalance correctly calls dependencies and returns result', () => {
    mockEthToWei.mockReturnValue({ toString: () => ('123456789') });
    expect(AccessSchemaBuilder.formatHasBalance(1, 123456789)).toStrictEqual({
      contractAddress: '',
      chainId: 1,
      method: 'eth_getBalance',
      parameters: [
        ':userAddress',
        'latest',
      ],
      returnValueTest: {
        comparator: '>=',
        value: '123456789',
      },
    });
  });

  test('formatHasBalanceERC20 correctly calls dependencies and returns result', () => {
    mockIsEthereumAddress.mockReturnValue(true);
    mockParseUnits.mockReturnValue({ toString: () => ('123456789') });

    expect(AccessSchemaBuilder.formatHasBalanceERC20(1, '0xerc20contract', 123456789, 12)).toStrictEqual({
      contractAddress: '0xerc20contract',
      chainId: 1,
      functionName: 'balanceOf',
      parameters: [
        ':userAddress',
      ],
      functionAbi: [{
        name: 'balanceOf',
        inputs: [
          {
            name: 'owner',
            type: 'address',
          },
        ],
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }],
      returnValueTest: {
        comparator: '>=',
        value: '123456789',
      },
    });

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xerc20contract');
    expect(mockParseUnits).toHaveBeenCalledWith('123456789', 12);
  });

  test('formatHasERC721 correctly calls dependencies and returns result', () => {
    mockIsEthereumAddress.mockReturnValue(true);

    expect(AccessSchemaBuilder.formatHasERC721(1, '0xerc721contract')).toStrictEqual({
      contractAddress: '0xerc721contract',
      chainId: 1,
      functionName: 'balanceOf',
      parameters: [
        ':userAddress',
      ],
      functionAbi: [{
        name: 'balanceOf',
        inputs: [
          {
            name: 'owner',
            type: 'address',
          },
        ],
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }],
      returnValueTest: {
        comparator: '>=',
        value: '1',
      },
    });

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xerc721contract');
  });

  test('formatHasERC1155 correctly calls dependencies and returns result', () => {
    mockIsEthereumAddress.mockReturnValue(true);

    expect(AccessSchemaBuilder.formatHasERC1155(1, '0xerc1155contract', 99)).toStrictEqual({
      contractAddress: '0xerc1155contract',
      chainId: 1,
      functionName: 'balanceOf',
      parameters: [
        ':userAddress',
        99,
      ],
      functionAbi: [{
        name: 'balanceOf',
        inputs: [
          {
            name: 'account',
            type: 'address',
          },
          {
            name: 'id',
            type: 'uint256',
          },
        ],
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }],
      returnValueTest: {
        comparator: '>=',
        value: '1',
      },
    });

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xerc1155contract');
  });

  test('formatIsWhitelisted correctly calls dependencies and returns result', () => {
    mockIsEthereumAddress.mockReturnValue(true);

    expect(AccessSchemaBuilder.formatIsWhitelisted(1, '0xuserAddress')).toStrictEqual({
      contractAddress: '',
      chainId: 1,
      method: 'whitelist',
      parameters: [
        ':userAddress',
      ],
      returnValueTest: {
        comparator: '==',
        value: '0xuserAddress',
      },
    });

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xuserAddress');
  });

  test('formatIsBlacklisted correctly calls dependencies and returns result', () => {
    mockIsEthereumAddress.mockReturnValue(true);

    expect(AccessSchemaBuilder.formatIsBlacklisted(1, '0xuserAddress')).toStrictEqual({
      contractAddress: '',
      chainId: 1,
      method: 'blacklist',
      parameters: [
        ':userAddress',
      ],
      returnValueTest: {
        comparator: '!=',
        value: '0xuserAddress',
      },
    });

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xuserAddress');
  });

  test('formatTimelock correctly calls dependencies and returns result', () => {
    expect(AccessSchemaBuilder.formatTimelock(1, 122397, '>=')).toStrictEqual({
      contractAddress: '',
      chainId: 1,
      method: 'timelock',
      parameters: [],
      returnValueTest: {
        comparator: '>=',
        value: 122397,
      },
    });
  });

  test('addAccessCondition correctly calls dependencies and returns result', () => {
    AccessSchemaBuilder.formatAccessOperator = jest.fn().mockImplementation((operator) => ({ key: operator }));
    AccessSchemaBuilder.formatHasBalance = jest.fn().mockImplementation(() => ({ key: 'hasBalance' }));
    AccessSchemaBuilder.formatHasBalanceERC20 = jest.fn().mockImplementation(() => ({ key: 'hasBalanceERC20' }));
    AccessSchemaBuilder.formatHasERC721 = jest.fn().mockImplementation(() => ({ key: 'hasERC721' }));
    AccessSchemaBuilder.formatHasERC1155 = jest.fn().mockImplementation(() => ({ key: 'hasERC1155' }));
    AccessSchemaBuilder.formatIsWhitelisted = jest.fn().mockImplementation(() => ({ key: 'isWhitelisted' }));
    AccessSchemaBuilder.formatIsBlacklisted = jest.fn().mockImplementation(() => ({ key: 'isBlacklisted' }));
    AccessSchemaBuilder.formatTimelock = jest.fn().mockImplementation(() => ({ key: 'timelock' }));

    const accessSchemaBuilder = new AccessSchemaBuilder();

    accessSchemaBuilder.addAccessCondition({ key: 'hasBalance', chainId: 123, minBalance: 1.5 });
    expect(AccessSchemaBuilder.formatHasBalance).toHaveBeenCalledWith(123, 1.5);

    accessSchemaBuilder.addAccessCondition({
      key: 'hasBalanceERC20', chainId: 123, contractAddress: '0x123456789', minBalance: 1.5, decimals: 18,
    }, 'and');
    expect(AccessSchemaBuilder.formatAccessOperator).toHaveBeenCalledWith('and');
    expect(AccessSchemaBuilder.formatHasBalanceERC20).toHaveBeenCalledWith(123, '0x123456789', 1.5, 18);

    accessSchemaBuilder.addAccessCondition({
      key: 'hasERC721', chainId: 123, contractAddress: '0x123456789',
    }, 'or');
    expect(AccessSchemaBuilder.formatAccessOperator).toHaveBeenCalledWith('or');
    expect(AccessSchemaBuilder.formatHasERC721).toHaveBeenCalledWith(123, '0x123456789');

    accessSchemaBuilder.addAccessCondition({
      key: 'hasERC1155', chainId: 123, contractAddress: '0x123456789', tokenId: 321,
    }, 'and');
    expect(AccessSchemaBuilder.formatAccessOperator).toHaveBeenCalledWith('and');
    expect(AccessSchemaBuilder.formatHasERC1155).toHaveBeenCalledWith(123, '0x123456789', 321);

    accessSchemaBuilder.addAccessCondition({
      key: 'isWhitelisted', chainId: 123, whitelistedAddress: '0x123456789',
    }, 'or');
    expect(AccessSchemaBuilder.formatAccessOperator).toHaveBeenCalledWith('or');
    expect(AccessSchemaBuilder.formatIsWhitelisted).toHaveBeenCalledWith(123, '0x123456789');

    accessSchemaBuilder.addAccessCondition({
      key: 'isBlacklisted', chainId: 123, blacklistedAddress: '0x123456789',
    }, 'and');
    expect(AccessSchemaBuilder.formatAccessOperator).toHaveBeenCalledWith('and');
    expect(AccessSchemaBuilder.formatIsBlacklisted).toHaveBeenCalledWith(123, '0x123456789');

    accessSchemaBuilder.addAccessCondition({
      key: 'timelock', chainId: 123, timestamp: 1234567, comparator: '>=',
    }, 'and');
    expect(AccessSchemaBuilder.formatAccessOperator).toHaveBeenCalledWith('and');
    expect(AccessSchemaBuilder.formatTimelock).toHaveBeenCalledWith(123, 1234567, '>=');

    expect(accessSchemaBuilder.getAccessSchema()).toStrictEqual([
      { key: 'hasBalance' },
      { key: 'and' },
      { key: 'hasBalanceERC20' },
      { key: 'or' },
      { key: 'hasERC721' },
      { key: 'and' },
      { key: 'hasERC1155' },
      { key: 'or' },
      { key: 'isWhitelisted' },
      { key: 'and' },
      { key: 'isBlacklisted' },
      { key: 'and' },
      { key: 'timelock' },
    ]);
  });

  test('addAccessCondition throws when function call missing is missing parameters', () => {
    AccessSchemaBuilder.formatAccessOperator = jest.fn().mockImplementation((operator) => ({ key: operator }));
    AccessSchemaBuilder.formatHasBalance = jest.fn().mockImplementation(() => ({ key: 'hasBalance' }));
    AccessSchemaBuilder.formatHasBalanceERC20 = jest.fn().mockImplementation(() => ({ key: 'hasBalanceERC20' }));
    AccessSchemaBuilder.formatHasERC721 = jest.fn().mockImplementation(() => ({ key: 'hasERC721' }));
    AccessSchemaBuilder.formatHasERC1155 = jest.fn().mockImplementation(() => ({ key: 'hasERC1155' }));
    AccessSchemaBuilder.formatIsWhitelisted = jest.fn().mockImplementation(() => ({ key: 'isWhitelisted' }));
    AccessSchemaBuilder.formatIsBlacklisted = jest.fn().mockImplementation(() => ({ key: 'isBlacklisted' }));
    AccessSchemaBuilder.formatTimelock = jest.fn().mockImplementation(() => ({ key: 'timelock' }));

    const accessSchemaBuilder = new AccessSchemaBuilder();

    accessSchemaBuilder.addAccessCondition({ key: 'hasBalance', chainId: 123, minBalance: 1.5 });

    expect(() => {
      accessSchemaBuilder.addAccessCondition({ key: 'hasBalance', chainId: 123, minBalance: 1.5 });
    }).toThrow(new Error('You are adding multiple access conditions and must specify a accessOperator'));

    expect(() => {
      accessSchemaBuilder.addAccessCondition({ key: 'hasBalance', chainId: 123 }, 'and');
    }).toThrow(new Error('Missing required schema parameter'));

    expect(() => {
      accessSchemaBuilder.addAccessCondition({
        key: 'hasBalanceERC20', chainId: 123, contractAddress: '0x123456789', minBalance: 1.5,
      }, 'and');
    }).toThrow(new Error('Missing required schema parameter'));

    expect(() => {
      accessSchemaBuilder.addAccessCondition({ key: 'hasERC721', chainId: 123 }, 'and');
    }).toThrow(new Error('Missing required schema parameter'));

    expect(() => {
      accessSchemaBuilder.addAccessCondition({ key: 'hasERC1155', chainId: 123, contractAddress: '0x123456789' }, 'and');
    }).toThrow(new Error('Missing required schema parameter'));

    expect(() => {
      accessSchemaBuilder.addAccessCondition({ key: 'isWhitelisted', chainId: 123 }, 'and');
    }).toThrow(new Error('Missing required schema parameter'));

    expect(() => {
      accessSchemaBuilder.addAccessCondition({ key: 'isBlacklisted', chainId: 123 }, 'and');
    }).toThrow(new Error('Missing required schema parameter'));

    expect(() => {
      accessSchemaBuilder.addAccessCondition({ key: 'timelock', chainId: 123 }, 'and');
    }).toThrow(new Error('Missing required schema parameter'));
  });

  test('updateAccessCondition correctly calls dependencies and returns result', () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn().mockImplementation(() => (true));

    const accessSchemaBuilder = new AccessSchemaBuilder([
      { key: 'hasBalance' },
      { key: 'and' },
      { key: 'hasBalanceERC20' },
      { key: 'or' },
      { key: 'hasERC721' },
      { key: 'and' },
      { key: 'hasERC1155' },
    ]);

    accessSchemaBuilder.updateAccessCondition({ key: 'newMockKey' }, 2);

    expect((AccessSchemaBuilder as any).validateAccessCondition).toHaveBeenCalledWith({ key: 'newMockKey' });
    expect(accessSchemaBuilder.getAccessSchema()).toStrictEqual([
      { key: 'hasBalance' },
      { key: 'and' },
      { key: 'newMockKey' },
      { key: 'or' },
      { key: 'hasERC721' },
      { key: 'and' },
      { key: 'hasERC1155' },
    ]);
  });

  test('updateAccessCondition throws when index is out of bounds', () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn().mockImplementation(() => (true));

    const accessSchemaBuilder = new AccessSchemaBuilder();

    expect(() => {
      accessSchemaBuilder.updateAccessCondition({ key: 'newMockKey' }, 2);
    }).toThrow(new Error('Invalid index'));
  });

  test('deleteAccessCondition correctly calls dependencies and returns result', () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn().mockImplementation(() => (true));

    const accessSchemaBuilder = new AccessSchemaBuilder([
      { key: 'hasBalance' },
      { key: 'and' },
      { key: 'hasBalanceERC20' },
      { key: 'or' },
      { key: 'hasERC721' },
      { key: 'and' },
      { key: 'hasERC1155' },
    ]);

    accessSchemaBuilder.deleteAccessCondition(2);

    expect(accessSchemaBuilder.getAccessSchema()).toStrictEqual([
      { key: 'hasBalance' },
      { key: 'and' },
      { key: 'hasERC721' },
      { key: 'and' },
      { key: 'hasERC1155' },
    ]);

    accessSchemaBuilder.deleteAccessCondition(4);

    expect(accessSchemaBuilder.getAccessSchema()).toStrictEqual([
      { key: 'hasBalance' },
      { key: 'and' },
      { key: 'hasERC721' },
    ]);

    accessSchemaBuilder.deleteAccessCondition(0);

    expect(accessSchemaBuilder.getAccessSchema()).toStrictEqual([
      { key: 'hasERC721' },
    ]);

    accessSchemaBuilder.deleteAccessCondition(0);

    expect(accessSchemaBuilder.getAccessSchema()).toStrictEqual([]);
  });

  test('deleteAccessCondition throws when index is invalid', () => {
    (AccessSchemaBuilder as any).validateAccessCondition = jest.fn().mockImplementation(() => (true));

    const accessSchemaBuilder = new AccessSchemaBuilder([
      { key: 'hasBalance' },
      { key: 'and' },
      { key: 'newMockKey' },
    ]);

    expect(() => {
      accessSchemaBuilder.deleteAccessCondition(1);
    }).toThrow(new Error('Invalid index'));

    expect(() => {
      accessSchemaBuilder.deleteAccessCondition(4);
    }).toThrow(new Error('Invalid index'));
  });
});
