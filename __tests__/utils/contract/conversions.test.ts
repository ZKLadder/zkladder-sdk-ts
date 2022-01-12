import { BigNumber } from 'ethers';
import {
  hexToDecimal,
  parseTransactionData,
  parseMinedTransactionData,
  weiToEth,
  gweiToEth,
  ethToWei,
} from '../../../src/utils/contract/conversions';

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
    gasLimit: BigNumber.from(35000000000),
    gasPrice: BigNumber.from(25000000000),
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
    cumulativeGasUsed: BigNumber.from(25000000000),
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

describe('weiToEth', () => {
  test('weiToEth correctly converts values', () => {
    const pow18 = BigNumber.from(10).pow(18);
    const pow17 = BigNumber.from(10).pow(17);
    const pow16 = BigNumber.from(10).pow(16);

    const oneEth = BigNumber.from(1).mul(pow18);
    const halfEth = BigNumber.from(5).mul(pow17);
    const quarterEth = BigNumber.from(25).mul(pow16);
    const hundredEth = BigNumber.from(100).mul(pow18);

    const oneEthString = ('1000000000000000000');
    const halfEthString = ('500000000000000000');
    const quarterEthString = ('250000000000000000');
    const hundredEthString = ('100000000000000000000');

    expect(weiToEth(oneEth)).toEqual(1);
    expect(weiToEth(halfEth)).toEqual(0.5);
    expect(weiToEth(quarterEth)).toEqual(0.25);
    expect(weiToEth(hundredEth)).toEqual(100);

    expect(weiToEth(oneEthString)).toEqual(1);
    expect(weiToEth(halfEthString)).toEqual(0.5);
    expect(weiToEth(quarterEthString)).toEqual(0.25);
    expect(weiToEth(hundredEthString)).toEqual(100);
  });
});

describe('gweiToEth', () => {
  test('gweiToEth correctly converts values', () => {
    const pow9 = BigNumber.from(10).pow(9);
    const pow8 = BigNumber.from(10).pow(8);
    const pow7 = BigNumber.from(10).pow(7);

    const oneEth = BigNumber.from(1).mul(pow9);
    const halfEth = BigNumber.from(5).mul(pow8);
    const quarterEth = BigNumber.from(25).mul(pow7);
    const hundredEth = BigNumber.from(100).mul(pow9);

    const oneEthString = ('1000000000');
    const halfEthString = ('500000000');
    const quarterEthString = ('250000000');
    const hundredEthString = ('100000000000');

    expect(gweiToEth(oneEth)).toEqual(1);
    expect(gweiToEth(halfEth)).toEqual(0.5);
    expect(gweiToEth(quarterEth)).toEqual(0.25);
    expect(gweiToEth(hundredEth)).toEqual(100);

    expect(gweiToEth(oneEthString)).toEqual(1);
    expect(gweiToEth(halfEthString)).toEqual(0.5);
    expect(gweiToEth(quarterEthString)).toEqual(0.25);
    expect(gweiToEth(hundredEthString)).toEqual(100);
  });
});

describe('ethToWei', () => {
  test('ethToWei correctly converts values', () => {
    const pow18 = BigNumber.from(10).pow(18);
    const pow17 = BigNumber.from(10).pow(17);
    const pow16 = BigNumber.from(10).pow(16);

    expect(ethToWei(0.25)).toStrictEqual(BigNumber.from(25).mul(pow16));
    expect(ethToWei(1.5)).toStrictEqual(BigNumber.from(15).mul(pow17));
    expect(ethToWei(1)).toStrictEqual(BigNumber.from(1).mul(pow18));
    expect(ethToWei(0.5)).toStrictEqual(BigNumber.from(5).mul(pow17));
  });
});
