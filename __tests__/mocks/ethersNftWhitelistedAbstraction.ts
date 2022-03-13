export default {
  // View functions
  beneficiaryAddress: jest.fn(),
  collectionDataUri: jest.fn(),

  // Transactions
  setCollectionDataUri: jest.fn(),
  setBeneficiary: jest.fn(),
  transferOwnership: jest.fn(),
  mintTo: jest.fn(),
  mint: jest.fn(),
};
