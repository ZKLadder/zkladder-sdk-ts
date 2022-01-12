import { providers } from 'ethers';
import { EthereumAddress } from '../interfaces/address';

/**
 * Exposes account data of the provider underlying the Ethers contract abstraction
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/
 */
export default class Provider {
  protected readonly ethersProvider: providers.Web3Provider;

  protected async getAccounts(): Promise<Array<EthereumAddress>> {
    const accounts = await this.ethersProvider.send('eth_accounts', []);
    return accounts;
  }

  protected async getPrimaryAccount(): Promise<EthereumAddress> {
    const accounts = await this.ethersProvider.send('eth_accounts', []);
    if (!Array.isArray(accounts) || accounts.length < 1) throw new Error('No primary account');
    return accounts[0];
  }
}
