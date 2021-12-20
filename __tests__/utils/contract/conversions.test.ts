import { BigNumber } from 'ethers';
import { hexToDecimal, parseTransactionData, parseMinedTransactionData } from '../../../src/utils/contract/conversions';

const testAddress = '0xFEf0C802A560bC64bCed0933b600635DAfa81c6F';

describe('hexToDecimal', () => {
  test('Converts hex to decimal as expected', () => {
    expect(hexToDecimal('0x0')).toStrictEqual(0);
    expect(hexToDecimal('0x4D2')).toStrictEqual(1234);
    expect(hexToDecimal('0x63')).toStrictEqual(99);
    expect(hexToDecimal('27A6')).toStrictEqual(10150); // exclude '0x'
    expect(hexToDecimal('11170')).toStrictEqual(70000); // exclude '0x'
  });
});

describe('parseTransactionData', () => {
  const txDataUnformatted = {
    chainId: 123,
    confirmations: 0,
    from: testAddress,
    gasLimit: BigNumber.from(35),
    gasPrice: BigNumber.from(25),
    hash: '0x0',
    nonce: 2,
    value: BigNumber.from(100),
    wait: 'mockFunction',
  };
  test('Correctly formats transaction data', () => {
    expect(parseTransactionData(txDataUnformatted)).toStrictEqual({
      chainId: 123,
      confirmations: 0,
      from: testAddress,
      gasLimit: 35,
      gasPrice: 25,
      txHash: '0x0',
      nonce: 2,
      value: 100,
      wait: 'mockFunction',
    });
  });

  test('Should throw when from field is an invalid address', () => {
    expect(() => {
      parseTransactionData({
        ...txDataUnformatted,
        from: 'fake address',
      });
    }).toThrow(new Error('Not a valid Eth address'));
  });
});

describe('parseMinedTransactionData', () => {
  const txDataUnformattedMined = {
    blockHash: '0x123',
    blockNumber: 11,
    confirmations: 3,
    contractAddress: testAddress,
    cumulativeGasUsed: BigNumber.from(25),
    from: testAddress,
    to: testAddress,
    status: 1,
    transactionHash: '0x0',
    transactionIndex: 2,
  };
  test('Correctly formats mined transaction data', () => {
    expect(parseMinedTransactionData(txDataUnformattedMined)).toStrictEqual({
      blockHash: '0x123',
      blockNumber: 11,
      confirmations: 3,
      contractAddress: testAddress,
      gasUsed: 25,
      from: testAddress,
      to: testAddress,
      status: 1,
      txHash: '0x0',
      txIndex: 2,
    });
  });

  test('Should throw when from field is an invalid address', () => {
    expect(() => {
      parseMinedTransactionData({
        ...txDataUnformattedMined,
        from: 'fake address',
      });
    }).toThrow(new Error('Not a valid Eth address'));
  });

  test('Should throw when to field is an invalid address', () => {
    expect(() => {
      parseMinedTransactionData({
        ...txDataUnformattedMined,
        to: 'fake address',
      });
    }).toThrow(new Error('Not a valid Eth address'));
  });
});
