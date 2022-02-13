/**
 * JSDOM does not polyfill certain module dependencies like TextEncoder
 * @jest-environment node
 */

import { MemberNft, Ipfs } from '../src/index';

describe('ZKL parent class', () => {
  test('defines supported modules', () => {
    expect(typeof MemberNft).toBe('function');
    expect(typeof Ipfs).toBe('function');
    // @TODO add further test cases here when building new services
  });
});
