import { providers } from 'ethers';
import { EthereumAddress } from '../../src/interfaces/address';
import Provider from '../../src/modules/provider';

// Extend Provider class and unit test its protected methods
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

  public async getChainId() {
    return super.getChainId();
  }

  public async signTypedData(data:string) {
    return super.signTypedData(data);
  }
}

const mockProvider = {
  send: jest.fn(),
  provider: {},
} as jest.Mocked<any>;

describe('Provider class', () => {
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

  test('getChainId correctly calls dependencies and returns results', async () => {
    mockProvider.send.mockResolvedValueOnce('0x1');

    const result = await providerWrapper.getChainId();

    expect(mockProvider.send).toHaveBeenCalledWith('eth_chainId', []);
    expect(result).toStrictEqual(1);
  });

  test('signTypeData correctly calls dependencies and returns results with metamask provider', async () => {
    jest.spyOn(providerWrapper, 'getPrimaryAccount').mockImplementation(() => Promise.resolve('0x123456789' as EthereumAddress));
    mockProvider.send.mockResolvedValueOnce('0xSIGNEDDATA');
    mockProvider.provider.isMetaMask = true;

    const result = await providerWrapper.signTypedData('testdata');

    expect(mockProvider.send).toHaveBeenCalledWith('eth_signTypedData_v4', [
      '0x123456789',
      'testdata',
    ]);
    expect(result).toStrictEqual('0xSIGNEDDATA');
  });

  test('signTypeData correctly calls dependencies and returns results with non-metamask provider', async () => {
    jest.spyOn(providerWrapper, 'getPrimaryAccount').mockImplementation(() => Promise.resolve('0x123456789' as EthereumAddress));
    mockProvider.send.mockResolvedValueOnce('0xSIGNEDDATA');
    mockProvider.provider.isMetaMask = false;

    const result = await providerWrapper.signTypedData('testdata');

    expect(mockProvider.send).toHaveBeenCalledWith('eth_signTypedData', [
      '0x123456789',
      'testdata',
    ]);
    expect(result).toStrictEqual('0xSIGNEDDATA');
  });
});
