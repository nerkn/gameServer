import { Elysia } from "elysia";
import { db } from "@/config/db";
import { Games } from "./entities/games";

export const games = new Elysia().use(db).group("/api", (app) =>
  app.get("/rooms", async ({ drizzle }) => {
    let games = await drizzle.select().from(Games);
    console.log("burdan gecer");
    return games;
  })
);
