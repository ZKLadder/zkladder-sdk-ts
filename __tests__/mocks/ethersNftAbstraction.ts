export default {
  // View functions
  name: jest.fn(),
  symbol: jest.fn(),
  ownerOf: jest.fn(),
  balanceOf: jest.fn(),
  totalSupply: jest.fn(),
  tokenURI: jest.fn(),
  getApproved: jest.fn(),
  isApprovedForAll: jest.fn(),
  supportsInterface: jest.fn(),
  tokenByIndex: jest.fn(),
  tokenOfOwnerByIndex: jest.fn(),

  // Transactions
  mint: jest.fn(),
  'safeTransferFrom(address,address,uint256)': jest.fn(),
  approve: jest.fn(),
  setApprovalForAll: jest.fn(),
};
