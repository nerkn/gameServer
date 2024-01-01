import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";

import { authentication } from "./auth.service";
import { db } from "@/config/db";

export { authentication };
export const auth = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ["content-type"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      origin: (request): boolean => {
        const origin = request.headers.get("origin");
        return !!origin;
      },
    })
  )
  .use(authentication)
  .use(db)
  .group("/user", (app) =>
    app
      .guard(
        {
          body: t.Object({
            name: t.Optional(t.String({ default: "" })),
            email: t.String({ minLength: 3 }),
            password: t.String({ minLength: 6 }),
          }),
        },
        (app) =>
          app
            .post("/signIn", async ({ body, signInUser, drizzle }) => {
              try {
                return signInUser(body);
              } catch (e) {
                return { err: 1, msg: "some err", e };
              }
            })
            .post("/register", async ({ body, register, signInUser }) => {
              let ret = await register({ ...body, name: body.name ?? "" });
              switch (ret.action) {
                case "signUserIn":
                  return signInUser(body);
                case "username Taken":
                  return {
                    err: 1,
                    msg: "Username taken/ Kullanıcı adı alınmış",
                  };
                case "Login link send":
                  return {
                    err: 0,
                    msg: "Activation mail sent / Mailinizi onaylayabilirisiniz.",
                  };
                default:
                  console.log("noldu acep ?", ret);
                  return { err: 1, msg: "unkown" };
              }
            })
            .get(
              "/activation/:acti",
              async ({ activation, params: { acti } }) => {
                if (!acti) return { err: 1, msg: "Cant get activation!" };
                return (await activation(acti))
                  ? { err: 0, msg: "Activated" }
                  : { err: 1, msg: "Error!?!" };
              }
            )
      )
      .post("/sign-out", async ({ signOut }) => {
        signOut();
      })
  );
