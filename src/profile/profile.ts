import { auth, authentication } from "@/auth/auth.controller";
import { db } from "@/config/db";
import { UserBid } from "@/game/entities/UserBid";
import { sql, eq } from "drizzle-orm";
import { Elysia } from "elysia";

export const profile = new Elysia()
  .use(authentication)
  .group("/api/profile", (app) =>
    app
      .use(auth)
      .use(db)
      .get("/hourly", async ({ getCurrentUser, drizzle }) => {
        return await getCurrentUser().then((user) => {
          let createdAt = sql`substr(${UserBid.createdAt}, 1, 12)`;
          return drizzle
            .select({
              date: createdAt,
              amount: sql<number>`sum(${UserBid.amounth})`.mapWith(Number),
            })
            .from(UserBid)
            .where(eq(UserBid.user, user.id))
            .groupBy(createdAt);
        });
      })
  );
