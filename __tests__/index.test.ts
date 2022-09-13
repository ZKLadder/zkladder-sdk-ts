/**
 * JSDOM does not polyfill certain module dependencies like TextEncoder
 * @jest-environment node
 */

import {
  MemberNft, MemberNftV2, Ipfs, utilities, AccessValidator, ERC20,
} from '../src/index';

describe('ZKL parent class', () => {
  test('defines supported modules', () => {
    expect(typeof MemberNft).toBe('function');
    expect(typeof MemberNftV2).toBe('function');
    expect(typeof ERC20).toBe('function');
    expect(typeof Ipfs).toBe('function');
    expect(typeof AccessValidator).toBe('function');
    expect(typeof utilities).toBe('object');
    // @TODO add further test cases here when building new services
  });
});
