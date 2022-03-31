import getNetworkById from '../../src/constants/networks';

describe('getNetworkById tests', () => {
  test('getNetworkById returns the correct network when called', () => {
    expect(getNetworkById(1)).toStrictEqual({
      name: 'Ethereum',
      currency: 'ETH',
      chainId: 1,
      RPCEndpoint: 'https://mainnet.infura.io/v3/2d33fc4d9a9b4140b8582c1ef3bd12e8',
    });
  });

  test('getNetworkById throws an error when an unknown param is passed', () => {
    expect(() => (getNetworkById(101 as any))).toThrow(new Error('Requested unsupported network id'));
  });
});
