import { Contract } from 'ethers';
import { EthereumAddress } from '../interfaces/address';

/**
 * Adds query support for base ERC-20 defined functionality
 * https://docs.openzeppelin.com/contracts/4.x/erc20
 * @remarks Module is read-only and does not support transactions
 * @TODO Implement remaining functions
 */
class ERC20ReadOnly {
  public readonly address: EthereumAddress;

  protected contractAbstraction: Contract;

  public async decimals(): Promise<number> {
    const decimals = await this.contractAbstraction.decimals();
    return decimals;
  }
}

export { ERC20ReadOnly };
