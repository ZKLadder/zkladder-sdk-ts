export default {
  // View functions
  beneficiaryAddress: jest.fn(),
  salePrice: jest.fn(),

  // Transactions
  setSalePrice: jest.fn(),
  setBeneficiary: jest.fn(),
  transferOwnership: jest.fn(),
  mintTo: jest.fn(),
  mint: jest.fn(),
};
