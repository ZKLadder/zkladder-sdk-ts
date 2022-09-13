import {
  providers, Contract, ContractInterface, getDefaultProvider,
} from 'ethers';
import { ERC20ReadOnly as ERC20ReadOnlyModule } from '../modules/ERC20';
import { ERC20ReadOnlyArgs } from '../interfaces/erc20';
import { EthereumAddress, isEthereumAddress } from '../interfaces/address';
import getNetworkById from '../constants/networks';

const constructorGuard = { };

class ERC20 extends ERC20ReadOnlyModule {
  public readonly address: EthereumAddress;

  protected readonly ethersProvider: providers.BaseProvider;

  constructor(guard:any, options: ERC20ReadOnlyArgs) {
    super();

    if (guard !== constructorGuard) throw new Error('Cannot call constructor directly; Use ERC20ReadOnly.setup function');

    const {
      address, chainId,
    } = options;

    this.address = isEthereumAddress(address);

    const { RPCEndpoint } = getNetworkById(chainId as any);
    this.ethersProvider = getDefaultProvider(RPCEndpoint);
  }

  public registerAbi(abi:ContractInterface) {
    this.contractAbstraction = new Contract(
      this.address,
      abi,
      this.ethersProvider,
    );
  }

  public static setup(options:ERC20ReadOnlyArgs): ERC20 {
    if ('chainId' in options) {
      const erc20ReadOnly = new ERC20(constructorGuard, options);

      // Currently only implements to decimals function
      const abi = [
        {
          constant: true,
          inputs: [],
          name: 'decimals',
          outputs: [
            {
              name: '',
              type: 'uint8',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ];

      erc20ReadOnly.registerAbi(abi);
      return erc20ReadOnly;
    }
    throw new Error('Must pass in a valid chainId');
  }
}

export { ERC20 };
