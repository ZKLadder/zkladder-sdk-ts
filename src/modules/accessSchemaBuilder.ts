import { utils } from 'ethers';
import { ethToWei } from '../utils/contract/conversions';
import { isEthereumAddress } from '../interfaces/address';
import { AccessConditionsOptions } from '../interfaces/accessSchema';

/*
 * Abstraction used for defining and editing ZKL compliant access schemas for token gates
 * @TODO Add Github/documentation link
 */
class AccessSchemaBuilder {
  protected accessSchema: { [key: string]: any }[];

  constructor(accessSchema?:{ [key: string]: any }[]) {
    if (accessSchema) {
      accessSchema.forEach((accessCondition) => {
        AccessSchemaBuilder.validateAccessCondition(accessCondition);
      });
      this.accessSchema = [...accessSchema];
    } else this.accessSchema = [];
  }

  public getAccessSchema() {
    return this.accessSchema;
  }

  public addAccessCondition(options: AccessConditionsOptions, accessOperator?:string) {
    if (this.accessSchema.length > 0) {
      if (!accessOperator) throw new Error('You are adding multiple access conditions and must specify a accessOperator');
      this.accessSchema.push(AccessSchemaBuilder.formatAccessOperator(accessOperator));
    }

    let accessCondition;
    const {
      key, chainId, contractAddress, minBalance, decimals, tokenId, whitelistedAddress, blacklistedAddress, timestamp, comparator,
    } = options;

    switch (key) {
      case 'hasBalance':
        if (chainId && minBalance) accessCondition = AccessSchemaBuilder.formatHasBalance(chainId, minBalance);
        else throw new Error('Missing required schema parameter');
        break;

      case 'hasBalanceERC20':
        if (chainId && contractAddress && minBalance && decimals) {
          accessCondition = AccessSchemaBuilder.formatHasBalanceERC20(chainId, contractAddress, minBalance, decimals);
        } else throw new Error('Missing required schema parameter');
        break;

      case 'hasERC721':
        if (chainId && contractAddress) accessCondition = AccessSchemaBuilder.formatHasERC721(chainId, contractAddress);
        else throw new Error('Missing required schema parameter');
        break;

      case 'hasERC1155':
        if (chainId && contractAddress && tokenId) {
          accessCondition = AccessSchemaBuilder.formatHasERC1155(chainId, contractAddress, tokenId);
        } else throw new Error('Missing required schema parameter');
        break;

      case 'isWhitelisted':
        if (chainId && whitelistedAddress) accessCondition = AccessSchemaBuilder.formatIsWhitelisted(chainId, whitelistedAddress);
        else throw new Error('Missing required schema parameter');
        break;

      case 'isBlacklisted':
        if (chainId && blacklistedAddress) accessCondition = AccessSchemaBuilder.formatIsBlacklisted(chainId, blacklistedAddress);
        else throw new Error('Missing required schema parameter');
        break;

      case 'timelock':
        if (timestamp && comparator) accessCondition = AccessSchemaBuilder.formatTimelock(chainId, timestamp, comparator);
        else throw new Error('Missing required schema parameter');
        break;

      default:
        throw new Error('Unknown accessSchema key');
    }

    this.accessSchema.push(accessCondition);
  }

  public updateAccessCondition(newAccessCondition:{ [key: string]: any }, index:number) {
    if (index >= this.accessSchema.length) throw new Error('Invalid index');
    AccessSchemaBuilder.validateAccessCondition(newAccessCondition);
    this.accessSchema[index] = newAccessCondition;
  }

  public deleteAccessCondition(index:number) {
    if (index % 2 === 1 || index >= this.accessSchema.length) throw new Error('Invalid index');
    if (this.accessSchema.length === 1) {
      this.accessSchema = [];
    } else if (index === this.accessSchema.length - 1) {
      this.accessSchema = this.accessSchema.slice(0, index - 1);
    } else {
      this.accessSchema = [...this.accessSchema.slice(0, index), ...this.accessSchema.slice(index + 2)];
    }
  }

  private static validateAccessCondition(accessCondition:{ [key: string]: any }) {
    if (accessCondition.operator === 'and' || accessCondition.operator === 'or') return true;
    if (typeof accessCondition.contractAddress !== 'string') throw new Error('Schema has incorrectly formatted contract address');
    if (!accessCondition.chainId) throw new Error('Schema has incorrectly formatted chainId');
    if (!accessCondition.returnValueTest) throw new Error('Schema has incorrectly formatted returnValueTest');
    if (!accessCondition.parameters) throw new Error('Schema is missing function or method params');
    if (accessCondition.functionName && !accessCondition.functionAbi) throw new Error('Schema has incorrectly formatted functionAbi');
    if (!accessCondition.functionName && !accessCondition.method) throw new Error('Schema is missing function or method name');
    return true;
  }

  public static formatAccessOperator(operator:string) {
    if (operator !== 'and' && operator !== 'or') throw new Error('Invalid operator');
    return { operator };
  }

  public static formatHasBalance(chainId:number, minBalance:number) {
    return {
      contractAddress: '',
      chainId,
      method: 'eth_getBalance',
      parameters: [
        ':userAddress',
        'latest',
      ],
      returnValueTest: {
        comparator: '>=',
        value: ethToWei(minBalance).toString(),
      },
    };
  }

  public static formatHasBalanceERC20(chainId:number, contractAddress:string, minBalance:number, decimals:number) {
    isEthereumAddress(contractAddress);
    return {
      contractAddress,
      chainId,
      functionName: 'balanceOf',
      parameters: [
        ':userAddress',
      ],
      functionAbi: [{
        name: 'balanceOf',
        inputs: [
          {
            name: 'owner',
            type: 'address',
          },
        ],
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }],
      returnValueTest: {
        comparator: '>=',
        value: utils.parseUnits(minBalance.toString(), decimals).toString(),
      },
    };
  }

  public static formatHasERC721(chainId:number, contractAddress:string) {
    isEthereumAddress(contractAddress);
    return {
      contractAddress,
      chainId,
      functionName: 'balanceOf',
      parameters: [
        ':userAddress',
      ],
      functionAbi: [{
        name: 'balanceOf',
        inputs: [
          {
            name: 'owner',
            type: 'address',
          },
        ],
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }],
      returnValueTest: {
        comparator: '>=',
        value: '1',
      },
    };
  }

  public static formatHasERC1155(chainId:number, contractAddress:string, tokenId:number) {
    isEthereumAddress(contractAddress);
    return {
      contractAddress,
      chainId,
      functionName: 'balanceOf',
      parameters: [
        ':userAddress',
        tokenId,
      ],
      functionAbi: [{
        name: 'balanceOf',
        inputs: [
          {
            name: 'account',
            type: 'address',
          },
          {
            name: 'id',
            type: 'uint256',
          },
        ],
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }],
      returnValueTest: {
        comparator: '>=',
        value: '1',
      },
    };
  }

  public static formatIsWhitelisted(chainId:number, whitelistedAddress:string) {
    isEthereumAddress(whitelistedAddress);
    return {
      contractAddress: '',
      chainId,
      method: 'whitelist',
      parameters: [
        ':userAddress',
      ],
      returnValueTest: {
        comparator: '==',
        value: whitelistedAddress,
      },
    };
  }

  public static formatIsBlacklisted(chainId:number, blacklistedAddress:string) {
    isEthereumAddress(blacklistedAddress);
    return {
      contractAddress: '',
      chainId,
      method: 'blacklist',
      parameters: [
        ':userAddress',
      ],
      returnValueTest: {
        comparator: '!=',
        value: blacklistedAddress,
      },
    };
  }

  public static formatTimelock(chainId:number, timestamp:number, comparator: string) {
    return {
      contractAddress: '',
      chainId,
      method: 'timelock',
      parameters: [],
      returnValueTest: {
        comparator,
        value: timestamp,
      },
    };
  }
}

export default AccessSchemaBuilder;
