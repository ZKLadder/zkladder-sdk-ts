import { Contract, getDefaultProvider } from 'ethers';
import { ERC20 } from '../../src/services/ERC20';
import { isEthereumAddress } from '../../src/interfaces/address';

jest.mock('@zkladder/zkladder-contracts', () => (jest.fn()));
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
  getDefaultProvider: jest.fn(),
}));

jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn(),
}));

jest.mock('../../src/constants/networks', () => (jest.fn(() => ({
  name: 'Ethereum',
  currency: 'ETH',
  chainId: 1,
  RPCEndpoint: 'https://mock.mock',
}))));

const mockReadOnlyProvider = getDefaultProvider as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;
const mockIsEthereumAddress = isEthereumAddress as jest.Mocked<any>;

describe('ERC20Factory tests', () => {
  const mockProvider = { send: jest.fn(), getSigner: jest.fn(() => ('mockSigner')) };

  mockReadOnlyProvider.mockReturnValue(mockProvider);
  mockIsEthereumAddress.mockReturnValue('0x123456789');

  const setupParams = {
    chainId: 1,
    address: '0x123456789',
  };

  test('setup correctly calls dependencies', async () => {
    const erc20 = await ERC20.setup(setupParams);

    expect(mockReadOnlyProvider).toHaveBeenCalledWith('https://mock.mock');
    expect(mockContract).toHaveBeenCalledWith(
      '0x123456789',
      [{
        constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], payable: false, stateMutability: 'view', type: 'function',
      }],
      mockProvider,
    );
    expect(erc20 instanceof ERC20).toBe(true);
  });
});
