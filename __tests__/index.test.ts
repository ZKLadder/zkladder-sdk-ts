/**
 * JSDOM does not polyfill certain module dependencies like TextEncoder
 * @jest-environment node
 */

import {
  MemberNftV1, MemberNft, Ipfs, utilities,
} from '../src/index';

describe('ZKL parent class', () => {
  test('defines supported modules', () => {
    expect(typeof MemberNftV1).toBe('function');
    expect(typeof MemberNft).toBe('function');
    expect(typeof Ipfs).toBe('function');
    expect(typeof utilities).toBe('object');
    // @TODO add further test cases here when building new services
  });
});
