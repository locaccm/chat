const request = require("supertest");
const { app, server } = require("../src/server");

afterAll((done) => {
  server.close(() => {
    done();
  });
});

describe("API Tests", () => {
  test("GET /api/owners should return a list of owners", async () => {
    const res = await request(app).get("/api/owners");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("USEC_TYPE", "OWNER");
  });

  test("GET /api/owners/:id should return a specific owner", async () => {
    const res = await request(app).get("/api/owners/1");
    expect(res.status).toBe(200);
    expect(res.body.USEC_TYPE).toBe("OWNER");
  });

  test("GET /api/tenants should return a list of tenants", async () => {
    const res = await request(app).get("/api/tenants");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].USEC_TYPE).toBe("TENANT");
  });

  test("GET /api/tenants/:id should return a specific tenant", async () => {
    const res = await request(app).get("/api/tenants/2");
    expect(res.status).toBe(200);
    expect(res.body.USEC_TYPE).toBe("TENANT");
  });

  test("GET /api/owners/:id/tenants should return tenants of a specific owner", async () => {
    const res = await request(app).get("/api/owners/1/tenants");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/tenants/:id/owner should return the owner of a tenant", async () => {
    const res = await request(app).get("/api/tenants/2/owner");
    expect(res.status).toBe(200);
    expect(res.body.USEC_TYPE).toBe("OWNER");
  });

  test("GET /api/messages?from=1&to=2 should return messages between two users", async () => {
    const res = await request(app).get("/api/messages?from=1&to=2");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/messages should send a new message", async () => {
    const res = await request(app).post("/api/messages").send({
      sender: 1,
      receiver: 2,
      content: "Hello from test!",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toHaveProperty("MESC_CONTENT", "Hello from test!");
  });
});
