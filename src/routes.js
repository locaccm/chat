const express = require("express");
const { users, messages } = require("./database");

const router = express.Router();

// Helper pour filtrer les rôles
const isOwner = (user) => user.USEC_TYPE === "Owner";
const isTenant = (user) => user.USEC_TYPE === "Tenant";

/**
 * GET /owners - getOwners
 * Accessible par Owner & Tenant
 */
router.get("/owners", (req, res) => {
  const owners = users.filter(isOwner);
  res.json(owners);
});

/**
 * GET /owners/:id - getOwnerById
 * Accessible par Owner & Tenant
 */
router.get("/owners/:id", (req, res) => {
  const owner = users.find((u) => u.USEN_ID == req.params.id && isOwner(u));
  if (!owner) return res.status(404).json({ error: "Owner not found" });
  res.json(owner);
});

/**
 * GET /tenants - getTenants
 * Accessible par Owner uniquement
 */
router.get("/tenants", (req, res) => {
  const tenants = users.filter(isTenant);
  res.json(tenants);
});

/**
 * GET /tenants/:id - getTenantById
 * Accessible par Owner & Tenant
 */
router.get("/tenants/:id", (req, res) => {
  const tenant = users.find((u) => u.USEN_ID == req.params.id && isTenant(u));
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  res.json(tenant);
});

/**
 * GET /owners/:id/tenants - getTenantsByOwner
 * Accessible par Owner uniquement
 * Suppose que chaque tenant a un champ OWNER_ID qui pointe vers son propriétaire
 */
router.get("/owners/:id/tenants", (req, res) => {
  const tenants = users.filter(
    (u) => isTenant(u) && u.USEN_INVITE == req.params.id
  );
  res.json(tenants);
});

/**
 * GET /tenants/:id/owner - getOwnerByTenant
 * Accessible par Owner & Tenant
 */
router.get("/tenants/:id/owner", (req, res) => {
  const tenant = users.find((u) => u.USEN_ID == req.params.id && isTenant(u));
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });

  const owner = users.find((u) => u.USEN_ID == tenant.USEN_INVITE);
  if (!owner) return res.status(404).json({ error: "Owner not found" });

  res.json(owner);
});

/**
 * GET /messages?from=1&to=2 - getMessages
 * Accessible par Owner & Tenant
 */
router.get("/messages", (req, res) => {
  const { from, to } = req.query;

  const chatMessages = messages.filter(
    (m) =>
      (m.MESN_SENDER == from && m.MESN_RECEIVER == to) ||
      (m.MESN_SENDER == to && m.MESN_RECEIVER == from)
  );
  res.json(chatMessages);
});

/**
 * POST /messages - sendMessage
 * Accessible par Owner & Tenant
 */
router.post("/messages", (req, res) => {
  const { sender, receiver, content } = req.body;
  if (!sender || !receiver || !content) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const newMessage = {
    MESN_ID: messages.length + 1,
    MESN_SENDER: sender,
    MESN_RECEIVER: receiver,
    MESC_CONTENT: content,
    MESD_DATE: new Date(),
  };

  messages.push(newMessage);
  res.json({ success: true, message: newMessage });
});

module.exports = router;
