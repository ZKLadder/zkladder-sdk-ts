import getNetworkById from '../../src/constants/networks';

describe('getNetworkById tests', () => {
  test('getNetworkById returns the correct network when called', () => {
    expect(getNetworkById(31337)).toStrictEqual({
      name: 'Hardhat',
      currency: 'HAT',
      chainId: 31337,
      RPCEndpoint: 'http://localhost:8545',
    });
  });

  test('getNetworkById throws an error when an unknown param is passed', () => {
    expect(() => (getNetworkById(101 as any))).toThrow(new Error('Requested unsupported network id'));
  });
});
