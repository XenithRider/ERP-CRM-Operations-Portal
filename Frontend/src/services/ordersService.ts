// Legacy service stubs — functionality migrated to challansService.ts
export const ordersService = {
  list: () => Promise.resolve([]),
  getById: (_id: string) => Promise.resolve(null),
};
