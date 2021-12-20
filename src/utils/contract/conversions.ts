import { TransactionData, MinedTransactionData } from '../../interfaces/transaction';
import { isEthereumAddress } from '../../interfaces/address';

const hexToDecimal = (hexString: string): number => parseInt(hexString, 16);

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
    gasLimit: gasLimit?.toNumber(),
    gasPrice: gasPrice?.toNumber(),
    txHash: hash,
    nonce,
    value: value?.toNumber(),
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
    gasUsed: cumulativeGasUsed?.toNumber(),
    from: isEthereumAddress(from),
    to: isEthereumAddress(to),
    status,
    txHash: transactionHash,
    txIndex: transactionIndex,
  };
};

export { hexToDecimal, parseTransactionData, parseMinedTransactionData };
