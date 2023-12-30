import Elysia, { Static, t } from "elysia";
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { envConfig } from "@/envConfig";
import { UnauthorizedError, NotAManagerError } from "./errors";
import { db } from "@/config/db";
import { UsersTable } from "./entities/user";
import { eq } from "drizzle-orm";
import { UserBid } from "@/game/entities/UserBid";

const jwtPayloadSchema = t.Object({
  id: t.String(),
  balance: t.Integer(),
  name: t.String(),
  role: t.String(),
});

export const authentication = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    NOT_A_MANAGER: NotAManagerError,
  })
  .onError(({ code, error, set }) => {
    console.log(error);
    switch (code) {
      case "UNAUTHORIZED":
        set.status = 401;
        return { code, message: error.message };
      case "NOT_A_MANAGER":
        set.status = 401;
        return { code, message: error.message };
      case "VALIDATION":
        set.status = "Precondition Failed";
        return { code, message: error.message };
      default:
        console.log("noldu acep");
        set.status = "Unauthorized";

        return { code, message: error.message };
    }
  })
  .use(
    jwt({
      name: "jwt",
      secret: envConfig.JWT_SECRET,
      schema: jwtPayloadSchema,
    })
  )
  .use(cookie())
  .use(db)
  .derive(({ jwt, cookie, setCookie, removeCookie, drizzle }) => {
    return {
      getCurrentUser: async () => {
        const payload = await jwt.verify(cookie.auth);

        if (!payload) {
          throw new UnauthorizedError();
        }

        return payload;
      },
      async placeBid(
        user: string,
        game: string,
        item: number,
        amounth: number
      ) {
        let userBalance = await drizzle
          .select({ balance: UsersTable.balance })
          .from(UsersTable)
          .where(eq(UsersTable.id, user));
        if (
          !userBalance ||
          !userBalance.length ||
          (userBalance[0]?.balance ?? 0) < amounth
        )
          return false;
        let updateRes = await drizzle
          .update(UsersTable)
          .set({ balance: (userBalance[0].balance ?? 0) - amounth })
          .where(eq(UsersTable.id, user));
        console.log("placeBid updateRes", updateRes);
        let insertRes = await drizzle.insert(UserBid).values({
          user,
          game,
          item,
          amounth,
        });
        console.log("placebid resolutions: ", updateRes, insertRes);
        return true;
      },
      signUser: async (payload: Static<typeof jwtPayloadSchema>) => {
        setCookie("auth", await jwt.sign(payload), {
          httpOnly: true,
          maxAge: 7 * 86400,
          path: "/",
        });
      },
      signOut: () => {
        removeCookie("auth");
      },
    };
  })
  .derive(({ getCurrentUser }) => {
    return {
      getRoom: async () => {
        const user = await getCurrentUser();

        if (!user.id) {
          throw new NotAManagerError();
        }

        return user;
      },
    };
  });
