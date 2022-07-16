import {
  validateString, validateNumber, validateBoolean, validateAddress, validateConstructorParams, validateInitializerParams,
} from '../../../src/utils/contract/validators';

describe('Validators tests', () => {
  test('validateString', () => {
    expect(validateString(999 as any)).toStrictEqual(false);
    expect(validateString(true as any)).toStrictEqual(false);
    expect(validateString(['string'] as any)).toStrictEqual(false);
    expect(validateString({ test: 999 } as any)).toStrictEqual(false);
    expect(validateString('string')).toStrictEqual(true);
  });

  test('validateNumber', () => {
    expect(validateNumber(999)).toStrictEqual(true);
    expect(validateNumber(true as any)).toStrictEqual(false);
    expect(validateNumber(['string'] as any)).toStrictEqual(false);
    expect(validateNumber({ test: 999 } as any)).toStrictEqual(false);
    expect(validateNumber('string' as any)).toStrictEqual(false);
  });

  test('validateAddress', () => {
    expect(validateAddress(999 as any)).toStrictEqual(false);
    expect(validateAddress(true as any)).toStrictEqual(false);
    expect(validateAddress(['string'] as any)).toStrictEqual(false);
    expect(validateAddress({ test: 999 } as any)).toStrictEqual(false);
    expect(validateAddress('string')).toStrictEqual(false);
    expect(validateAddress('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7')).toStrictEqual(true);
  });

  test('validateBoolean', () => {
    expect(validateBoolean(999 as any)).toStrictEqual(false);
    expect(validateBoolean(true)).toStrictEqual(true);
    expect(validateBoolean(['string'] as any)).toStrictEqual(false);
    expect(validateBoolean({ test: 999 } as any)).toStrictEqual(false);
    expect(validateBoolean('string' as any)).toStrictEqual(false);
  });
});

describe('validateConstructorParams tests', () => {
  test('ABI with no constructor', () => {
    expect(() => {
      validateConstructorParams([], []);
    }).toThrow('Contract does not have a constructor');
  });

  test('Incorrect number of params', () => {
    const mockAbi = [
      { type: 'constructor', inputs: [1, 2, 3, 4] },
    ];
    expect(() => {
      validateConstructorParams(mockAbi, [1, 2, 3]);
    }).toThrow('Incorrect number of params');
  });

  test('One of the parameters is invalid', () => {
    const mockAbi = [
      {
        type: 'constructor',
        inputs: [
          { type: 'string' },
          { type: 'bool' },
          { type: 'uint' },
          { type: 'address' },
        ],
      },
    ];
    expect(() => {
      validateConstructorParams(mockAbi, ['test', true, 123, 'fakeaddress']);
    }).toThrow('Constructor param at index 3 is not a valid address');
  });

  test('All parameters are valid', () => {
    const mockAbi = [
      {
        type: 'constructor',
        inputs: [
          { type: 'string' },
          { type: 'bool' },
          { type: 'uint' },
          { type: 'address' },
        ],
      },
    ];
    expect(() => {
      validateConstructorParams(mockAbi, ['test', true, 123, '0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B']);
    }).not.toThrow();
  });
});

describe('validateInitializerParams tests', () => {
  test('ABI with no initializer', () => {
    expect(() => {
      validateInitializerParams([], []);
    }).toThrow('Contract does not have an initializer');
  });

  test('Incorrect number of params', () => {
    const mockAbi = [
      { name: 'initialize', inputs: [1, 2, 3, 4] },
    ];
    expect(() => {
      validateInitializerParams(mockAbi, [1, 2, 3]);
    }).toThrow('Incorrect number of params');
  });

  test('One of the parameters is invalid', () => {
    const mockAbi = [
      {
        name: 'initialize',
        inputs: [
          { type: 'string' },
          { type: 'bool' },
          { type: 'uint' },
          { type: 'address' },
        ],
      },
    ];
    expect(() => {
      validateInitializerParams(mockAbi, ['test', true, 123, 'fakeaddress']);
    }).toThrow('Constructor param at index 3 is not a valid address');
  });

  test('All parameters are valid', () => {
    const mockAbi = [
      {
        name: 'initialize',
        inputs: [
          { type: 'string' },
          { type: 'bool' },
          { type: 'uint' },
          { type: 'address' },
        ],
      },
    ];
    expect(() => {
      validateInitializerParams(mockAbi, ['test', true, 123, '0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B']);
    }).not.toThrow();
  });
});
