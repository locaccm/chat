import request from "supertest";
import { app, server } from "../server";
import prisma from "../prisma";
const {
  mockFindMany,
  mockFindFirst,
  mockFindUnique,
  mockCreate,
} = require("../prisma");

jest.mock("axios");
jest.mock("../prisma");

import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedAxios.post.mockResolvedValue({
    status: 200,
    data: { allowed: true },
  });
});

afterAll((done) => {
  server.close(() => {
    done();
  });
});

// Helpers pour centraliser les appels authentifiés
function authGet(url: string, role: "OWNER" | "TENANT" = "OWNER") {
  return request(app).get(url).set("Authorization", `Bearer ${role}`);
}

function authPost(url: string, data: any, role: "OWNER" | "TENANT" = "OWNER") {
  return request(app)
    .post(url)
    .send(data)
    .set("Authorization", `Bearer ${role}`);
}

describe("API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/owners should return a list of owners", async () => {
    mockFindMany.mockResolvedValue([
      { USEN_ID: 1, USEC_TYPE: "OWNER", USEC_LNAME: "Smith" },
    ]);

    const res = await authGet("/api/owners", "OWNER");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("USEC_TYPE", "OWNER");
  });

  test("GET /api/owners/:id should return a specific owner", async () => {
    mockFindFirst.mockResolvedValue({
      USEN_ID: 1,
      USEC_TYPE: "OWNER",
      USEC_LNAME: "Smith",
    });

    const res = await authGet("/api/owners/1", "TENANT");
    expect(res.status).toBe(200);
    expect(res.body.USEC_TYPE).toBe("OWNER");
  });

  test("GET /api/owners/:id should return 404 if owner not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await authGet("/api/owners/999", "TENANT");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "OWNER not found" });
  });

  test("GET /api/tenants should return a list of tenants", async () => {
    mockFindMany.mockResolvedValue([
      { USEN_ID: 2, USEC_TYPE: "TENANT", USEC_LNAME: "Doe" },
    ]);

    const res = await authGet("/api/tenants", "OWNER");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].USEC_TYPE).toBe("TENANT");
  });

  test("GET /api/tenants/:id should return a specific tenant", async () => {
    mockFindFirst.mockResolvedValue({
      USEN_ID: 2,
      USEC_TYPE: "TENANT",
      USEC_LNAME: "Doe",
    });

    const res = await authGet("/api/tenants/2", "TENANT");
    expect(res.status).toBe(200);
    expect(res.body.USEC_TYPE).toBe("TENANT");
  });

  test("GET /api/tenants/:id should return 404 if tenant not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await authGet("/api/tenants/999", "TENANT");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "TENANT not found" });
  });

  test("GET /api/owners/:id/tenants should return tenants of a specific owner", async () => {
    mockFindMany.mockResolvedValue([
      { USEN_ID: 3, USEC_TYPE: "TENANT", USEC_LNAME: "Johnson" },
    ]);

    const res = await authGet("/api/owners/1/tenants", "OWNER");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/tenants/:id/owner should return the owner of a tenant", async () => {
    mockFindFirst
      .mockResolvedValueOnce({
        USEN_ID: 2,
        USEC_TYPE: "TENANT",
        USEN_INVITE: 1,
      })
      .mockResolvedValueOnce({
        USEN_ID: 1,
        USEC_TYPE: "OWNER",
        USEC_LNAME: "Smith",
      });

    const res = await authGet("/api/tenants/2/owner", "TENANT");
    expect(res.status).toBe(200);
    expect(res.body.USEC_TYPE).toBe("OWNER");
  });

  test("GET /api/tenants/:id/owner should return 404 if tenant not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await authGet("/api/tenants/999/owner", "OWNER");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "TENANT not found" });
  });

  test("GET /api/messages?from=1&to=2 should return messages between two users", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        MESN_ID: 1,
        MESN_SENDER: 1,
        MESN_RECEIVER: 2,
        MESC_CONTENT: "Hello",
      },
    ]);

    const res = await authGet("/api/messages?from=1&to=2", "TENANT");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/tenants/:id/owner should return 404 if owner not found", async () => {
    mockFindFirst
      .mockResolvedValueOnce({
        USEN_ID: 2,
        USEC_TYPE: "TENANT",
        USEN_INVITE: 999,
      })
      .mockResolvedValueOnce(null);

    const res = await authGet("/api/tenants/2/owner", "OWNER");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "OWNER not found" });
  });

  test("POST /api/messages should send a new message", async () => {
    mockCreate.mockResolvedValueOnce({
      MESN_ID: 1,
      MESN_SENDER: 1,
      MESN_RECEIVER: 2,
      MESC_CONTENT: "Hello from test!",
    });

    const res = await authPost(
      "/api/messages",
      {
        sender: 1,
        receiver: 2,
        content: "Hello from test!",
      },
      "TENANT",
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toHaveProperty("MESC_CONTENT", "Hello from test!");
  });

  test("POST /api/messages should return 500 on server error", async () => {
    mockCreate.mockImplementationOnce(() => {
      throw new Error("Mocked DB failure");
    });

    const res = await authPost(
      "/api/messages",
      {
        sender: 1,
        receiver: 2,
        content: "This should trigger an error",
      },
      "OWNER",
    );

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Error server" });
  });

  test("GET /api/owners should return 401 if authorization token is missing", async () => {
    const res = await request(app).get("/api/owners"); // Pas de header Authorization

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: "Authorization token missing or malformed",
    });
  });
});
