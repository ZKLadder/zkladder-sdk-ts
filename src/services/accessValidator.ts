import { BigNumber, Contract, providers } from 'ethers';
import AccessSchemaBuilder from '../modules/accessSchemaBuilder';
import { isEthereumAddress } from '../interfaces/address';
import { AccessOperator } from '../interfaces/accessSchema';
import getNetworkById from '../constants/networks';

/*
 * Abstraction used for defining, editing and validating ZKL compliant access schemas for token gates
 * @TODO Add Github/documentation link
 * @TODO Recursive checking for nested access schemas
 */
class AccessValidator extends AccessSchemaBuilder {
  public async validate(address:string) {
    try {
      isEthereumAddress(address);
    } catch (err:any) {
      return false;
    }

    const promises:any = [];

    this.accessSchema.forEach((accessCondition, i) => {
      if (i % 2 === 0) {
        if (accessCondition.method === 'whitelist') {
          promises.push(AccessValidator.validateWhitelistCondition(address, accessCondition));
        } else if (accessCondition.method === 'blacklist') {
          promises.push(AccessValidator.validateBlacklistCondition(address, accessCondition));
        } else if (accessCondition.method === 'timelock') {
          promises.push(AccessValidator.validateTimelock(address, accessCondition));
        } else if (accessCondition.method) {
          promises.push(AccessValidator.validateRpcCondition(address, accessCondition));
        } else if (accessCondition.functionName) {
          promises.push(AccessValidator.validateContractCondition(address, accessCondition));
        }
      }
    });

    const results = await Promise.all(promises);

    const accessOperator: AccessOperator = this.accessSchema[1]?.operator;

    if (results.length === 0) return true;

    if (results.length === 1) return results[0];

    if (accessOperator === 'and') {
      return !results.includes(false);
    }

    return results.includes(true);
  }

  private static async validateWhitelistCondition(address:string, accessCondition:{ [key: string]: any }) {
    if (address.toLowerCase() === accessCondition.returnValueTest?.value?.toLowerCase()) return true;
    return false;
  }

  private static async validateBlacklistCondition(address:string, accessCondition:{ [key: string]: any }) {
    if (address.toLowerCase() !== accessCondition.returnValueTest?.value?.toLowerCase()) return true;
    return false;
  }

  private static async validateTimelock(address:string, accessCondition:{ [key: string]: any }) {
    const { comparator, value } = accessCondition.returnValueTest;
    if (comparator === '>=') return (Date.now() >= value);
    if (comparator === '<=') return (Date.now() <= value);
    return false;
  }

  private static async validateRpcCondition(address:string, accessCondition:{ [key: string]: any }) {
    const { RPCEndpoint } = getNetworkById(accessCondition.chainId);
    const ethersProvider = new providers.JsonRpcProvider(RPCEndpoint);

    const parameters = accessCondition.parameters.map((param:string) => {
      if (param === ':userAddress') return address;
      return param;
    });

    const result = await ethersProvider.send(
      accessCondition.method,
      [...parameters],
    );

    const { comparator, value } = accessCondition.returnValueTest;

    if (comparator === '==') {
      return value.toString() === result.toString();
    }
    if (comparator === '>=') {
      return BigNumber.from(result).gte(BigNumber.from(value));
    }
    if (comparator === '<=') {
      return BigNumber.from(result).lte(BigNumber.from(value));
    }

    throw new Error(`Unknown comparator ${comparator}`);
  }

  private static async validateContractCondition(address:string, accessCondition:{ [key: string]: any }) {
    const { RPCEndpoint } = getNetworkById(accessCondition.chainId);
    const ethersProvider = new providers.JsonRpcProvider(RPCEndpoint);

    const {
      contractAddress, functionAbi, functionName, returnValueTest,
    } = accessCondition;

    const contractAbstraction = new Contract(contractAddress, functionAbi, ethersProvider);

    const parameters = accessCondition.parameters.map((param:string) => {
      if (param === ':userAddress') return address;
      return param;
    });

    const result = await contractAbstraction[functionName](...parameters);

    const { comparator, value } = returnValueTest;

    if (comparator === '==') {
      return value.toString() === result.toString();
    }
    if (comparator === '>=') {
      return (result as BigNumber).gte(BigNumber.from(value));
    }
    if (comparator === '<=') {
      return (result as BigNumber).lte(BigNumber.from(value));
    }

    throw new Error(`Unknown comparator ${comparator}`);
  }
}

export default AccessValidator;
