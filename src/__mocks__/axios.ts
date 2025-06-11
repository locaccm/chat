export default {
  post: jest.fn().mockResolvedValue({
    status: 200,
    data: { allowed: true },
  }),
};
