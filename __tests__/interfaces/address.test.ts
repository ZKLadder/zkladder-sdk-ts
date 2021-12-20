import { isEthereumAddress } from '../../src/interfaces/address';

const testAddress = '0xFEf0C802A560bC64bCed0933b600635DAfa81c6F';

describe('isAddress tests', () => {
  test('It throws if passed an invalid address', () => {
    expect(() => { isEthereumAddress('fake address'); }).toThrow(new Error('Not a valid Eth address'));
  });

  test('Returns address if address is valid', () => {
    expect(isEthereumAddress(testAddress)).toStrictEqual(testAddress);
  });
});
