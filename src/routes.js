const express = require("express");
const pool = require("./db");

const router = express.Router();

/**
 * GET /owners - getOwners
 */
router.get("/owners", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM \"USER\" WHERE \"USEC_TYPE\" = 'OWNER'");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * GET /owners/:id - getOwnerById
 */
router.get("/owners/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM \"USER\" WHERE \"USEN_ID\" = $1 AND \"USEC_TYPE\" = 'OWNER'",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Owner not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * GET /tenants - getTenants
 */
router.get("/tenants", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM \"USER\" WHERE \"USEC_TYPE\" = 'TENANT'");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * GET /tenants/:id - getTenantById
 */
router.get("/tenants/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM \"USER\" WHERE \"USEN_ID\" = $1 AND \"USEC_TYPE\" = 'TENANT'",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Tenant not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * GET /owners/:id/tenants - getTenantsByOwner
 */
router.get("/owners/:id/tenants", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM \"USER\" WHERE \"USEC_TYPE\" = 'TENANT' AND \"USEN_INVITE\" = $1",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * GET /tenants/:id/owner - getOwnerByTenant
 */
router.get("/tenants/:id/owner", async (req, res) => {
  try {
    const tenantResult = await pool.query(
      "SELECT * FROM \"USER\" WHERE \"USEN_ID\" = $1 AND \"USEC_TYPE\" = 'TENANT'",
      [req.params.id]
    );
    if (tenantResult.rows.length === 0) return res.status(404).json({ error: "Tenant not found" });

    const ownerId = tenantResult.rows[0].USEN_INVITE;
    const ownerResult = await pool.query("SELECT * FROM \"USER\" WHERE \"USEN_ID\" = $1", [ownerId]);

    if (ownerResult.rows.length === 0) return res.status(404).json({ error: "Owner not found" });

    res.json(ownerResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * GET /messages?from=1&to=2 - getMessages
 */
router.get("/messages", async (req, res) => {
  const { from, to } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM "MESSAGE"
       WHERE ("MESN_SENDER" = $1 AND "MESN_RECEIVER" = $2) 
          OR ("MESN_SENDER" = $2 AND "MESN_RECEIVER" = $1) 
       ORDER BY "MESD_DATE" ASC`,
      [from, to]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * POST /messages - sendMessage
 */
router.post("/messages", async (req, res) => {
  const { sender, receiver, content } = req.body;
  if (!sender || !receiver || !content) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "MESSAGE" ("MESN_SENDER", "MESN_RECEIVER", "MESC_CONTENT", "MESD_DATE") 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [sender, receiver, content]
    );

    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

module.exports = router;
