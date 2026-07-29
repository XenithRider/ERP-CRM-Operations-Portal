// Legacy service stubs — functionality migrated to customersService.ts
export const accountsService = {
  list: () => Promise.resolve([]),
  getById: (_id: string) => Promise.resolve(null),
  create: (_payload: unknown) => Promise.resolve(null),
};
