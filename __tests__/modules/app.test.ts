import ZKLadder from '../../src/modules/app';

jest.mock('../../src/utils/infuraIpfs/client', () => (jest.fn()));

describe('ZKL parent class', () => {
  const zkl = new ZKLadder('12345', 'mockProvider');

  test('defines supported modules', () => {
    expect(typeof zkl.nft).toBe('function');
    expect(typeof zkl.ipfs).toBe('function');
    // @TODO add further test cases here when building new modules
  });
});
