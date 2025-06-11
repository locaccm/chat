const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();

const prisma = {
  uSER: {
    findMany: mockFindMany,
    findUnique: mockFindUnique,
    findFirst: mockFindFirst,
  },
  mESSAGE: {
    findMany: mockFindMany,
    create: mockCreate,
  },
};

export default prisma;
export { mockFindMany, mockFindFirst, mockFindUnique, mockCreate };
