import { Contract, utils } from 'ethers';
import { isEthereumAddress, EthereumAddress } from '../../src/interfaces/address';
import AccessControl from '../../src/modules/accessControl';
import ethersAccessControlAbstraction from '../mocks/ethersAccessControlAbstraction';
import { parseTransactionData, parseMinedTransactionData } from '../../src/utils/contract/conversions';

// Extend AccessControl and unit test its methods
class AccessControlWrapper extends AccessControl {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn().mockImplementation((address) => (address)),
}));

jest.mock('ethers', () => ({
  utils: {
    keccak256: jest.fn(),
    toUtf8Bytes: jest.fn(),
  },
  BigNumber: {
    from: jest.fn(() => (10)),
  },
}));

jest.mock('../../src/utils/contract/conversions', () => ({
  parseTransactionData: jest.fn(),
  parseMinedTransactionData: jest.fn(),
}));

const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;
const mockKeccak256 = utils.keccak256 as jest.Mocked<any>;
const mockUtf8Bytes = utils.toUtf8Bytes as jest.Mocked<any>;
const mockParseTransaction = parseTransactionData as jest.Mocked<any>;
const mockParseMinedTransaction = parseMinedTransactionData as jest.Mocked<any>;

describe('AccessControl class', () => {
  const accessControlWrapper = new AccessControlWrapper(
    '0x12345' as EthereumAddress,
    ethersAccessControlAbstraction as any,
  );

  test('hasRole correctly calls dependencies and returns response', async () => {
    mockUtf8Bytes.mockReturnValueOnce('MOCKBYTES');
    mockKeccak256.mockReturnValueOnce('0xMOCKROLE');
    ethersAccessControlAbstraction.hasRole.mockResolvedValueOnce(false);

    const result = await accessControlWrapper.hasRole('MOCK_ROLE', '0xmockAddress');

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xmockAddress');
    expect(mockUtf8Bytes).toHaveBeenCalledWith('MOCK_ROLE');
    expect(mockKeccak256).toHaveBeenCalledWith('MOCKBYTES');
    expect(ethersAccessControlAbstraction.hasRole).toHaveBeenCalledWith(
      '0xMOCKROLE',
      '0xmockAddress',
    );
    expect(result).toEqual(false);
  });

  test('getRoleAdmin correctly calls dependencies and returns response', async () => {
    mockUtf8Bytes.mockReturnValueOnce('MOCKBYTES');
    mockKeccak256.mockReturnValueOnce('0xMOCKROLE');
    ethersAccessControlAbstraction.getRoleAdmin.mockResolvedValueOnce('0xrole_admin');

    const result = await accessControlWrapper.getRoleAdmin('MOCK_ROLE');

    expect(mockUtf8Bytes).toHaveBeenCalledWith('MOCK_ROLE');
    expect(mockKeccak256).toHaveBeenCalledWith('MOCKBYTES');
    expect(ethersAccessControlAbstraction.getRoleAdmin).toHaveBeenCalledWith(
      '0xMOCKROLE',
    );
    expect(result).toEqual('0xrole_admin');
  });

  test('grantRole correctly calls dependencies and returns response', async () => {
    mockUtf8Bytes.mockReturnValueOnce('MOCKBYTES');
    mockKeccak256.mockReturnValueOnce('0xMOCKROLE');
    ethersAccessControlAbstraction.grantRole.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await accessControlWrapper.grantRole('MOCK_ROLE', '0xsomeuser');

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xsomeuser');
    expect(mockUtf8Bytes).toHaveBeenCalledWith('MOCK_ROLE');
    expect(mockKeccak256).toHaveBeenCalledWith('MOCKBYTES');
    expect(ethersAccessControlAbstraction.grantRole).toHaveBeenCalledWith(
      '0xMOCKROLE',
      '0xsomeuser',
    );
    expect(result).toEqual({ transaction: 'result' });
  });

  test('grantRoleAndWait correctly calls dependencies and returns response', async () => {
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(accessControlWrapper, 'grantRole').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await accessControlWrapper.grantRoleAndWait('MOCK_ROLE', '0xsomeuser');

    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });

  test('revokeRole correctly calls dependencies and returns response', async () => {
    mockUtf8Bytes.mockReturnValueOnce('MOCKBYTES');
    mockKeccak256.mockReturnValueOnce('0xMOCKROLE');
    ethersAccessControlAbstraction.revokeRole.mockResolvedValueOnce({});
    mockParseTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await accessControlWrapper.revokeRole('MOCK_ROLE', '0xsomeuser');

    expect(mockIsEthereumAddress).toHaveBeenCalledWith('0xsomeuser');
    expect(mockUtf8Bytes).toHaveBeenCalledWith('MOCK_ROLE');
    expect(mockKeccak256).toHaveBeenCalledWith('MOCKBYTES');
    expect(ethersAccessControlAbstraction.revokeRole).toHaveBeenCalledWith(
      '0xMOCKROLE',
      '0xsomeuser',
    );
    expect(result).toEqual({ transaction: 'result' });
  });

  test('revokeRoleAndWait correctly calls dependencies and returns response', async () => {
    const wait = jest.fn();
    const tx = { wait };

    jest.spyOn(accessControlWrapper, 'revokeRole').mockImplementationOnce(() => (Promise.resolve(tx) as any));
    mockParseMinedTransaction.mockReturnValueOnce({ transaction: 'result' });

    const result = await accessControlWrapper.revokeRoleAndWait('MOCK_ROLE', '0xsomeuser');

    expect(wait).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ transaction: 'result' });
  });
});
