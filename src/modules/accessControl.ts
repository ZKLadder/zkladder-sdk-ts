import { Contract, utils } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../interfaces/address';
import { TransactionData } from '../interfaces/transaction';
import { parseTransactionData } from '../utils/contract/conversions';

/**
 * Adds query support for role based smart contract administration
 * https://docs.openzeppelin.com/contracts/4.x/access-control#role-based-access-control
 * @remarks Module is read-only and does not support transactions
 */
class AccessControlReadOnly {
  public readonly address: EthereumAddress;

  protected contractAbstraction: Contract;

  /* Read-Only Functions */
  public async hasRole(role:string, address:string): Promise<boolean> {
    isEthereumAddress(address);
    const roleHash = utils.keccak256(utils.toUtf8Bytes(role));
    const hasRole = await this.contractAbstraction.hasRole(roleHash, address);
    return hasRole;
  }

  public async getRoleAdmin(role:string): Promise<EthereumAddress> {
    const roleHash = utils.keccak256(utils.toUtf8Bytes(role));
    const hasRole = await this.contractAbstraction.getRoleAdmin(roleHash);
    return hasRole;
  }

  public async getRoleMemberCount(role:string): Promise<number> {
    const roleHash = utils.keccak256(utils.toUtf8Bytes(role));
    const count = await this.contractAbstraction.getRoleMemberCount(roleHash);
    return count.toNumber();
  }

  public async getRoleMemberByIndex(role:string, index:number): Promise<EthereumAddress> {
    const roleHash = utils.keccak256(utils.toUtf8Bytes(role));
    const member = await this.contractAbstraction.getRoleMember(roleHash, index);
    return member;
  }
}

class AccessControl extends AccessControlReadOnly {
  public async grantRole(role:string, address:string): Promise<TransactionData> {
    isEthereumAddress(address);
    const roleHash = utils.keccak256(utils.toUtf8Bytes(role));
    const tx = await this.contractAbstraction.grantRole(roleHash, address);
    return parseTransactionData(tx);
  }

  public async revokeRole(role:string, address:string): Promise<TransactionData> {
    isEthereumAddress(address);
    const roleHash = utils.keccak256(utils.toUtf8Bytes(role));
    const tx = await this.contractAbstraction.revokeRole(roleHash, address);
    return parseTransactionData(tx);
  }
}

export { AccessControlReadOnly, AccessControl };
