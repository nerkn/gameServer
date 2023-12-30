import { drizzle } from "drizzle-orm/mysql2";
import mysql2 from "mysql2";
import { envConfig } from "@/envConfig";
import * as schema from "./schema";
import Elysia from "elysia";

const client = mysql2.createPool(envConfig.DB_URL);

export const db = new Elysia({ name: "drizzle" }).decorate(
  "drizzle",
  drizzle(client, { schema, mode: "default", logger: true })
);
