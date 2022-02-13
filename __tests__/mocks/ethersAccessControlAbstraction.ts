export default {
  // View functions
  hasRole: jest.fn(),
  getRoleAdmin: jest.fn(),
  getRoleMemberCount: jest.fn(),
  getRoleMember: jest.fn(),

  // Transactions
  grantRole: jest.fn(),
  revokeRole: jest.fn(),
};
