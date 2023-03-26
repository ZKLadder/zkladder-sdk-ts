export default {
  // View functions
  beneficiaryAddress: jest.fn(),
  contractURI: jest.fn(),
  baseURI: jest.fn(),
  isTransferrable: jest.fn(),
  royaltyBasis: jest.fn(),
  totalTiers: jest.fn(),
  tierInfo: jest.fn(),
  tokenTiers: jest.fn(),
  salePrice: jest.fn(),

  // Transactions
  addTiers: jest.fn(),
  updateTiers: jest.fn(),
  setContractUri: jest.fn(),
  setBaseUri: jest.fn(),
  setBeneficiary: jest.fn(),
  setRoyalty: jest.fn(),
  setSalePrice: jest.fn(),
  transferOwnership: jest.fn(),
  mintTo: jest.fn(),
  batchMintTo: jest.fn(),
  mint: jest.fn(),
  batchMint: jest.fn(),
};
