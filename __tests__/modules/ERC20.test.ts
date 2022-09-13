import { providers, Contract } from 'ethers';
import { ERC20ReadOnly } from '../../src/modules/ERC20';
import { EthereumAddress } from '../../src/interfaces/address';
import ethersERC20Abstraction from '../mocks/ethersERC20Abstraction';

jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
}));

jest.mock('../../src/interfaces/address', () => ({
  isEthereumAddress: jest.fn().mockImplementation((address) => (address)),
}));

const mockProviders = providers as jest.Mocked<any>;
const mockContract = Contract as jest.Mocked<any>;

class ERC20ReadOnlyWrapper extends ERC20ReadOnly {
  protected readonly contractAbstraction: Contract;

  public readonly address: EthereumAddress;

  constructor(address:EthereumAddress, contractAbstraction: Contract) {
    super();
    this.address = address;
    this.contractAbstraction = contractAbstraction;
  }
}

describe('ERC20ReadOnly class', () => {
  mockProviders.Web3Provider.mockReturnValue({ getSigner: () => ('mockSigner') });
  mockContract.mockReturnValue(ethersERC20Abstraction);

  test('beneficiaryAddress correctly calls dependencies and returns results', async () => {
    const erc20 = new ERC20ReadOnlyWrapper('12345' as EthereumAddress, ethersERC20Abstraction as any);
    ethersERC20Abstraction.decimals.mockResolvedValueOnce(18);

    const result = await erc20.decimals();

    expect(ethersERC20Abstraction.decimals).toHaveBeenCalledTimes(1);
    expect(result).toEqual(18);
  });
});
