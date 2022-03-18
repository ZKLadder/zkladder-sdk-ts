export default {
  // View functions
  beneficiaryAddress: jest.fn(),
  contractURI: jest.fn(),

  // Transactions
  setContractUri: jest.fn(),
  setBeneficiary: jest.fn(),
  transferOwnership: jest.fn(),
  mintTo: jest.fn(),
  mint: jest.fn(),
};
