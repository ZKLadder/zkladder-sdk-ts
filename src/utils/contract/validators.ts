import { BigNumber } from 'ethers';
import { isEthereumAddress } from '../../interfaces/address';

const validateString = (constructParam:string) => {
  if (typeof constructParam !== 'string') return false;
  return true;
};

const validateNumber = (constructParam:number) => {
  if (typeof constructParam !== 'number') return false;
  try {
    BigNumber.from(constructParam);
  } catch (error) {
    return false;
  }
  return true;
};

const validateBoolean = (constructParam:boolean) => {
  if (typeof constructParam !== 'boolean') return false;
  return true;
};

const validateAddress = (constructParam:string) => {
  if (typeof constructParam !== 'string') return false;
  try { isEthereumAddress(constructParam); } catch (err:any) { return false; }
  return true;
};

/**
 * Validates a given set of smart contract constructor params against a given ABI
  @param contractABI - ABI of smart contract to validate
  @param constructParams - array of constructor params in the correct order
 */
const validateConstructorParams = (contractABI:any[], constructParams:any[]) => {
  const constructor = contractABI.find((func) => func.type === 'constructor');
  if (!constructor) throw new Error('Contract does not have a constructor');
  if (constructor.inputs.length !== constructParams.length) throw new Error('Incorrect number of params');

  constructParams.forEach((param, index) => {
    const abiDefinedType = constructor.inputs?.[index]?.type;
    if (abiDefinedType === 'string' && !validateString(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'bool' && !validateBoolean(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'address' && !validateAddress(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType.includes('uint') && !validateNumber(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
  });
};

/**
 * Used in place of validateConstructorParams, when validating upgradeable contracts
  @param contractABI - ABI of smart contract to validate
  @param initializerParams - array of params in the correct order
 */
const validateInitializerParams = (contractABI:any[], initializerParams:any[]) => {
  const initializer = contractABI.find((func) => func.name === 'initialize');
  if (!initializer) throw new Error('Contract does not have an initializer');

  if (initializer.inputs.length !== initializerParams.length) throw new Error('Incorrect number of params');

  initializerParams.forEach((param, index) => {
    const abiDefinedType = initializer.inputs?.[index]?.type;
    if (abiDefinedType === 'string' && !validateString(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'bool' && !validateBoolean(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'address' && !validateAddress(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType.includes('uint') && !validateNumber(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
  });
};

export {
  validateConstructorParams,
  validateInitializerParams,

  // exported for unit testing
  validateString,
  validateBoolean,
  validateAddress,
  validateNumber,
};
