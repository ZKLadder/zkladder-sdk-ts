import { utils } from 'ethers';
import { ethToWei } from '../utils/contract/conversions';
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
      this.accessSchema = structuredClone([...accessSchema]);
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

  public updateAccessCondition(options: {
    key?:string,
    chainId?:number,
    minBalance?:number,
    decimals?:number,
    contractAddress?:string,
    tokenId?:number | string,
    whitelistedAddress?:string,
    blacklistedAddress?:string,
    operator?:'and' | 'or',
    index:number }) {
    const {
      index,
      chainId,
      minBalance,
      decimals,
      contractAddress,
      tokenId,
      whitelistedAddress,
      blacklistedAddress,
      operator,
      key: updatedKey,
    } = options;
    if (index >= this.accessSchema.length) throw new Error('Invalid index');

    if (index % 2 === 1 && operator) {
      this.accessSchema[index] = { operator };
      return;
    }

    const hasAddress = typeof contractAddress === 'string';

    if (updatedKey === 'hasBalance' && chainId && minBalance) {
      this.accessSchema[index] = AccessSchemaBuilder.formatHasBalance(chainId, minBalance);
      return;
    }

    if (updatedKey === 'hasBalanceERC20' && chainId && hasAddress && minBalance && decimals) {
      this.accessSchema[index] = AccessSchemaBuilder.formatHasBalanceERC20(chainId, contractAddress, minBalance, decimals);
      return;
    }

    if (updatedKey === 'hasERC721' && chainId && hasAddress) {
      this.accessSchema[index] = AccessSchemaBuilder.formatHasERC721(chainId, contractAddress);
      return;
    }

    if (updatedKey === 'hasERC1155' && chainId && hasAddress) {
      this.accessSchema[index] = AccessSchemaBuilder.formatHasERC1155(chainId, contractAddress, tokenId || 0);
      return;
    }

    if (updatedKey === 'isWhitelisted' && chainId && typeof whitelistedAddress === 'string') {
      this.accessSchema[index] = AccessSchemaBuilder.formatIsWhitelisted(chainId, whitelistedAddress);
      return;
    }

    if (updatedKey === 'isBlacklisted' && chainId && typeof blacklistedAddress === 'string') {
      this.accessSchema[index] = AccessSchemaBuilder.formatIsBlacklisted(chainId, blacklistedAddress);
      return;
    }

    if (chainId) this.accessSchema[index].chainId = chainId;
    if (typeof whitelistedAddress === 'string' && this.accessSchema[index].key === 'isWhitelisted') this.accessSchema[index].returnValueTest.value = whitelistedAddress;
    if (typeof blacklistedAddress === 'string' && this.accessSchema[index].key === 'isBlacklisted') this.accessSchema[index].returnValueTest.value = blacklistedAddress;
    if (tokenId && this.accessSchema[index].key === 'hasERC1155') this.accessSchema[index].parameters[1] = tokenId;
    if (typeof contractAddress === 'string') this.accessSchema[index].contractAddress = contractAddress;
    if (minBalance?.toString() && this.accessSchema[index].key === 'hasBalance') {
      this.accessSchema[index].returnValueTest.value = ethToWei(minBalance).toString();
    }
    if (minBalance?.toString() && decimals && this.accessSchema[index].key === 'hasBalanceERC20') this.accessSchema[index].returnValueTest.value = utils.parseUnits(minBalance.toString(), decimals).toString();
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
    if (!accessCondition.functionName && !accessCondition.method && !accessCondition.key) throw new Error('Schema is missing function or method name');
    return true;
  }

  public static formatAccessOperator(operator:string) {
    if (operator !== 'and' && operator !== 'or') throw new Error('Invalid operator');
    return { operator };
  }

  public static formatHasBalance(chainId:number, minBalance:number) {
    return {
      key: 'hasBalance',
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
    return {
      key: 'hasBalanceERC20',
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
    return {
      key: 'hasERC721',
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

  public static formatHasERC1155(chainId:number, contractAddress:string, tokenId:number | string) {
    return {
      key: 'hasERC1155',
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
    return {
      key: 'isWhitelisted',
      contractAddress: '',
      chainId,
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
    return {
      key: 'isBlacklisted',
      contractAddress: '',
      chainId,
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
      key: 'timelock',
      contractAddress: '',
      chainId,
      parameters: [],
      returnValueTest: {
        comparator,
        value: timestamp,
      },
    };
  }
}

export default AccessSchemaBuilder;
