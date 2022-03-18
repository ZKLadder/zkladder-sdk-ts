import { BigNumber, utils } from 'ethers';
import { TransactionData, MinedTransactionData } from '../../interfaces/transaction';
import { isEthereumAddress } from '../../interfaces/address';

const hexToDecimal = (hexString: string): number => parseInt(hexString, 16);

/**
 * Accepts an Ethers.js BigNumber or string amount in Wei and returns the decimal amount in Eth rounded to the nearest 9 decimal places
 * @param weiAmount
 * @returns Amount in Eth
 */
const weiToEth = (weiAmount:BigNumber | string): number => {
  // string passed in
  if (typeof weiAmount === 'string') {
    return parseFloat(utils.formatUnits(
      weiAmount,
      'ether',
    ));
  }

  // BigNumber passed in
  return parseFloat(utils.formatUnits(
    weiAmount.toString(),
    'ether',
  ));
};

/**
 * Accepts an Ethers.js BigNumber or string amount in Gwei and returns the decimal amount in Eth rounded to the nearest 9 decimal places
 * @param gweiAmount
 * @returns Amount in Eth
 */
const gweiToEth = (gweiAmount:BigNumber | string): number => {
  const pow9 = BigNumber.from(10).pow(9);

  let weiAmount;
  if (typeof gweiAmount === 'string') weiAmount = BigNumber.from(gweiAmount).mul(pow9);
  else weiAmount = gweiAmount.mul(pow9);

  return weiToEth(weiAmount);
};

/**
 * Accepts a JS number in Eth and returns an Ethers.js BigNumber representing that amount in Wei
 * @param ethAmount
 * @returns Ether.js BigNumber in Wei
 */
const ethToWei = (ethAmount: number): BigNumber => utils.parseUnits(ethAmount.toString());

const parseTransactionData = (txData: any): TransactionData => {
  const {
    chainId,
    confirmations,
    from,
    gasLimit,
    gasPrice,
    hash,
    nonce,
    value,
    wait,
  } = txData;

  return {
    chainId,
    confirmations,
    from: isEthereumAddress(from),
    gasLimit: gasLimit.toNumber(),
    gasPrice: gasPrice.toNumber(),
    gasCost: gweiToEth(gasLimit.mul(gasPrice)),
    txHash: hash,
    nonce,
    value: weiToEth(value),
    wait,
  };
};

const parseMinedTransactionData = (txData: any): MinedTransactionData => {
  const {
    blockHash,
    blockNumber,
    confirmations,
    contractAddress,
    cumulativeGasUsed,
    from,
    to,
    status,
    transactionHash,
    transactionIndex,
  } = txData;

  return {
    blockHash,
    blockNumber,
    confirmations,
    contractAddress,
    gasUsed: gweiToEth(cumulativeGasUsed),
    from: isEthereumAddress(from),
    to: isEthereumAddress(to),
    status,
    txHash: transactionHash,
    txIndex: transactionIndex,
  };
};

export {
  hexToDecimal,
  parseTransactionData,
  parseMinedTransactionData,
  ethToWei,
  weiToEth,
  gweiToEth,
};
