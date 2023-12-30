import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";

import { authentication } from "./auth.service";
import { db } from "@/config/db";
import { UsersTable } from "./entities/user";
import { eq } from "drizzle-orm";

export { authentication };
export const auth = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ["content-type"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      origin: (request): boolean => {
        const origin = request.headers.get("origin");

        if (!origin) {
          return false;
        }

        return true;
      },
    })
  )
  .use(authentication)
  .use(db)
  .guard(
    {
      body: t.Object({
        email: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 }),
      }),
    },
    (app) =>
      app.post("/signIn", async ({ body, signUser, drizzle }) => {
        console.log("signin requeest");
        try {
          let dbUser = await drizzle
            .select()
            .from(UsersTable)
            .where(eq(UsersTable.email, body.email));
          if (dbUser.length) {
            if (dbUser[0].password == body.password) {
              let data = {
                id: dbUser[0].id,
                balance: 1000,
                name: dbUser[0].name,
                role: "user",
              };
              await signUser(data);
              return { err: false, msg: "login success", data };
            }
          }
          console.log("dbUser", dbUser);
          return { err: 1, msg: "user/email/password err" };
        } catch (e) {
          return { err: 1, msg: "some err", e };
        }
      })
  )
  .post("/sign-out", async ({ signOut }) => {
    signOut();
  });
