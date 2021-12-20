import { EthereumAddress } from './address';

interface TransactionData {
  chainId: number,
  confirmations: number,
  from: string,
  gasLimit: number,
  gasPrice: number,
  txHash: string,
  nonce: number,
  value: number,
  wait(): MinedTransactionData
}

interface MinedTransactionData {
  blockHash: string,
  blockNumber: number,
  confirmations: number,
  contractAddress?: EthereumAddress,
  gasUsed: number,
  from: EthereumAddress,
  to: EthereumAddress,
  status: number,
  txHash: string,
  txIndex: string
}

export { TransactionData, MinedTransactionData };
