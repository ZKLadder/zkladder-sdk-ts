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

  // Transactions
  addTiers: jest.fn(),
  updateTiers: jest.fn(),
  setContractUri: jest.fn(),
  setBaseUri: jest.fn(),
  setBeneficiary: jest.fn(),
  transferOwnership: jest.fn(),
  mintTo: jest.fn(),
  mint: jest.fn(),
};
