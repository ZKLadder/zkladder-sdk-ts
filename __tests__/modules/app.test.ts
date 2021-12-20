import ZKLadder from '../../src/modules/app';

describe('ZKL parent class', () => {
  const zkl = new ZKLadder('12345', 'mockProvider');

  test('defines supported modules', () => {
    expect(typeof zkl.nft).toBe('function');
    // @TODO add further test cases here when building new modules
  });
});
