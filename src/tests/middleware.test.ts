import { checkAccess } from "../Middleware/Checkaccess";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("checkAccess middleware", () => {
  const next = jest.fn();
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const res: any = { status };
  const rightName = "SOME_RIGHT";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SERVICE_URL = "http://auth-service";
  });

  test("should call next if AUTH_SERVICE_URL is not set", async () => {
    delete process.env.AUTH_SERVICE_URL;
    const middleware = checkAccess(rightName);
    const req: any = { headers: {} };
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("should return 401 if Authorization header is missing", async () => {
    const middleware = checkAccess(rightName);
    const req: any = { headers: {} };
    await middleware(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: "Authorization token missing or malformed",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if Authorization header malformed", async () => {
    const middleware = checkAccess(rightName);
    const req: any = { headers: { authorization: "InvalidToken" } };
    await middleware(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: "Authorization token missing or malformed",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next if axios returns 200", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const middleware = checkAccess(rightName);
    const req: any = { headers: { authorization: "Bearer token123" } };
    await middleware(req, res, next);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${process.env.AUTH_SERVICE_URL}/access/check`,
      { token: "token123", rightName },
    );
    expect(next).toHaveBeenCalled();
  });

  test("should return 403 if axios returns non-200 status", async () => {
    mockedAxios.post.mockResolvedValue({ status: 403 });
    const middleware = checkAccess(rightName);
    const req: any = { headers: { authorization: "Bearer token123" } };
    await middleware(req, res, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ error: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 on axios error", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Network error"));
    const middleware = checkAccess(rightName);
    const req: any = { headers: { authorization: "Bearer token123" } };
    await middleware(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: "Authorization failed",
      details: "Network error",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
