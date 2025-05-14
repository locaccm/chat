import express, { Request, Response } from "express";
import prisma from "./prisma";

const router = express.Router();

const getUsersByType = async (type: string, res: Response) => {
  try {
    const users = await prisma.uSER.findMany({
      where: { USEC_TYPE: type },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
};

const getUserByIdAndType = async (id: number, type: string, res: Response) => {
  try {
    const user = await prisma.uSER.findFirst({
      where: { USEN_ID: id, USEC_TYPE: type },
    });
    if (!user) return res.status(404).json({ error: `${type} not found` });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
};

/**
 * @swagger
 * /api/owners:
 *   get:
 *     summary: Get all owners
 *     description: Retrieve a list of all users with type "OWNER".
 *     tags:
 *       - Owners
 *     responses:
 *       200:
 *         description: A list of owners
 *       500:
 *         description: Server error
 */
router.get("/owners", (req, res) => getUsersByType("OWNER", res));

/**
 * @swagger
 * /api/owners/{id}:
 *   get:
 *     summary: Get an owner by ID
 *     description: Retrieve a single owner by their user ID.
 *     tags:
 *       - Owners
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the owner
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Owner found
 *       404:
 *         description: Owner not found
 *       500:
 *         description: Server error
 */
router.get("/owners/:id", (req, res) =>
  getUserByIdAndType(parseInt(req.params.id), "OWNER", res),
);

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Get all tenants
 *     description: Retrieve a list of all users with type "TENANT".
 *     tags:
 *       - Tenants
 *     responses:
 *       200:
 *         description: A list of tenants
 *       500:
 *         description: Server error
 */
router.get("/tenants", (req, res) => getUsersByType("TENANT", res));

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     summary: Get a tenant by ID
 *     description: Retrieve a single tenant by their user ID.
 *     tags:
 *       - Tenants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tenant
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant found
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Server error
 */
router.get("/tenants/:id", (req, res) =>
  getUserByIdAndType(parseInt(req.params.id), "TENANT", res),
);

/**
 * @swagger
 * /api/owners/{id}/tenants:
 *   get:
 *     summary: Get tenants by owner ID
 *     description: Retrieve all tenants invited by a specific owner.
 *     tags:
 *       - Owners
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the owner
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tenants
 *       500:
 *         description: Server error
 */
router.get("/owners/:id/tenants", async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.uSER.findMany({
      where: {
        USEC_TYPE: "TENANT",
        USEN_INVITE: parseInt(req.params.id),
      },
    });
    res.json(tenants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * @swagger
 * /api/tenants/{id}/owner:
 *   get:
 *     summary: Get the owner of a tenant
 *     description: Retrieve the owner who invited a specific tenant.
 *     tags:
 *       - Tenants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tenant
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Owner found
 *       404:
 *         description: Owner or tenant not found
 *       500:
 *         description: Server error
 */
router.get("/tenants/:id/owner", async (req: Request, res: Response) => {
  try {
    const tenant = await prisma.uSER.findFirst({
      where: { USEN_ID: parseInt(req.params.id), USEC_TYPE: "TENANT" },
    });
    if (!tenant) return res.status(404).json({ error: "TENANT not found" });

    const owner = await prisma.uSER.findFirst({
      where: { USEN_ID: tenant.USEN_INVITE ?? -1 },
    });
    if (!owner) return res.status(404).json({ error: "OWNER not found" });

    res.json(owner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get messages between two users
 *     description: Retrieve all messages exchanged between two users (ordered by date).
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         description: Sender user ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         required: true
 *         description: Receiver user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       500:
 *         description: Server error
 */
router.get("/messages", async (req: Request, res: Response) => {
  const { from, to } = req.query;

  try {
    const messages = await prisma.mESSAGE.findMany({
      where: {
        OR: [
          {
            MESN_SENDER: parseInt(String(from)),
            MESN_RECEIVER: parseInt(String(to)),
          },
          {
            MESN_SENDER: parseInt(String(to)),
            MESN_RECEIVER: parseInt(String(from)),
          },
        ],
      },
      orderBy: {
        MESD_DATE: "asc",
      },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     description: Create a new message between two users.
 *     tags:
 *       - Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender
 *               - receiver
 *               - content
 *             properties:
 *               sender:
 *                 type: string
 *               receiver:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
router.post("/messages", async (req: Request, res: Response) => {
  const { sender, receiver, content } = req.body;
  if (!sender || !receiver || !content) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const newMessage = await prisma.mESSAGE.create({
      data: {
        MESN_SENDER: parseInt(sender),
        MESN_RECEIVER: parseInt(receiver),
        MESC_CONTENT: content,
        MESD_DATE: new Date(),
      },
    });
    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
});

export default router;
