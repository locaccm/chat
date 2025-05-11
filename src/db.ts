import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString: string = process.env.DB_CONNECTION_STRING as string;

const pool = new Pool({
  connectionString,
});

export default pool;
