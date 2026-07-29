// Legacy service stubs — functionality migrated to customersService.ts
export const leadsService = {
  list: () => Promise.resolve([]),
  getById: (_id: string) => Promise.resolve(null),
  create: (_payload: unknown) => Promise.resolve(null),
  updateStage: (_id: string, _stage: string) => Promise.resolve(null),
};
