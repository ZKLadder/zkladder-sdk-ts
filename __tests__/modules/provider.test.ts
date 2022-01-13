import { providers } from 'ethers';
import Provider from '../../src/modules/provider';

// Extend ProviderWrapper and unit test its methods
class ProviderWrapper extends Provider {
  protected readonly ethersProvider: providers.Web3Provider;

  constructor(provider:providers.Web3Provider) {
    super();
    this.ethersProvider = provider;
  }

  public async getAccounts() {
    return super.getAccounts();
  }

  public async getPrimaryAccount() {
    return super.getPrimaryAccount();
  }
}

const mockProvider = {
  send: jest.fn(),
} as jest.Mocked<any>;

describe('NftEnumerable class', () => {
  const providerWrapper = new ProviderWrapper(
    mockProvider,
  );

  test('getAccounts correctly calls dependencies and returns results', async () => {
    mockProvider.send.mockResolvedValueOnce({ test: 'accounts' });

    const result = await providerWrapper.getAccounts();

    expect(mockProvider.send).toHaveBeenCalledWith('eth_accounts', []);
    expect(result).toStrictEqual({ test: 'accounts' });
  });

  test('getPrimaryAccount correctly calls dependencies and returns results', async () => {
    mockProvider.send.mockResolvedValueOnce([
      { account: 'one' },
      { account: 'two' },
      { account: 'three' },
    ]);

    const result = await providerWrapper.getPrimaryAccount();

    expect(mockProvider.send).toHaveBeenCalledWith('eth_accounts', []);
    expect(result).toStrictEqual({ account: 'one' });
  });

  test('getPrimaryAccount correctly throws when no accounts are present', async () => {
    mockProvider.send.mockResolvedValueOnce([]);

    await expect(providerWrapper.getPrimaryAccount()).rejects.toStrictEqual(new Error('No primary account'));
  });
});
