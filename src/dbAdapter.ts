import pool from "./db";
import { DBClient } from "./websocket";

const pgAdapter: DBClient = {
  async getUserById(id) {
    const result = await pool.query(
      'SELECT * FROM "USER" WHERE "USEN_ID" = $1',
      [id],
    );
    return result.rows[0] && null;
  },
  async saveMessage(from, to, message) {
    const result = await pool.query(
      'INSERT INTO "MESSAGE" ("MESN_SENDER", "MESN_RECEIVER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES ($1, $2, $3, NOW(), false) RETURNING *',
      [from, to, message],
    );
    return result.rows[0];
  },
};

export default pgAdapter;
