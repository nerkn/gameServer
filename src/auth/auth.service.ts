import Elysia, { Static, t } from "elysia";
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { envConfig } from "@/envConfig";
import { UnauthorizedError, NotAManagerError } from "./errors";
import { db } from "@/config/db";
import { UserCreate, UsersTable } from "./entities/user";
import { eq } from "drizzle-orm";
import { UserBid } from "@/game/entities/UserBid";
import { mailjet } from "@/libs/mailjet";

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
        return;
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
  .use(mailjet)
  .derive(({ jwt, cookie, setCookie, removeCookie, drizzle, sendJetMail }) => {
    return {
      getCurrentUser: async () => {
        const payload = await jwt.verify(cookie.auth);
        if (!payload) throw new UnauthorizedError();
        let userDb = await drizzle
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.id, payload.id));
        if (!userDb || !userDb.length) throw new UnauthorizedError();
        return { ...payload, balance: userDb[0].balance ?? 0 };
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
        let newBalance = (userBalance[0].balance ?? 0) - amounth;
        let updateRes = await drizzle
          .update(UsersTable)
          .set({ balance: newBalance })
          .where(eq(UsersTable.id, user));
        console.log("placeBid updateRes", updateRes);
        let insertRes = await drizzle.insert(UserBid).values({
          user,
          game,
          item,
          amounth,
        });
        console.log("placebid resolutions: ", updateRes, insertRes);
        return { newBalance };
      },
      signInUser: async (body: { email: string; password: string }) => {
        let dbUser = await drizzle
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.email, body.email));
        if (dbUser.length) {
          if (dbUser[0].password == body.password) {
            let data = {
              id: dbUser[0].id,
              balance: dbUser[0].balance ?? 0,
              name: dbUser[0].name,
              role: "user",
            };

            setCookie("auth", await jwt.sign(data), {
              httpOnly: true,
              maxAge: 7 * 86400,
              path: "/",
            });
            return { err: false, msg: "login success", data };
          }
        }
        console.log("dbUser", dbUser);
        return { err: 1, msg: "user/email/password err" };
      },
      signJWT: async (payload: Static<typeof jwtPayloadSchema>) => {
        setCookie("auth", await jwt.sign(payload), {
          httpOnly: true,
          maxAge: 7 * 86400,
          path: "/",
        });
      },
      activation: async (activationLink: string) => {
        if (!activationLink) return false;
        let who = await drizzle
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.activationLink, activationLink));
        if (!who || !who.length || !who[0].id) return false;
        drizzle
          .update(UsersTable)
          .set({ activationLink: null, balance: 200 })
          .where(eq(UsersTable.activationLink, activationLink));
        return true;
      },

      register: async (userInfo: UserCreate) => {
        let eu1 = await drizzle
          .select({ password: UsersTable.password })
          .from(UsersTable)
          .where(eq(UsersTable.email, userInfo.email));
        if (eu1 && eu1.length && eu1[0].password == userInfo.password)
          return { action: "signUserIn" };
        let eu2 = await drizzle
          .select({ email: UsersTable.email })
          .from(UsersTable)
          .where(eq(UsersTable.name, userInfo.name));
        if (eu2 && eu2.length && eu2[0].email)
          return { action: "username Taken" };
        let activationLink = (new Date().getTime() * 3).toString(33);
        let newUser = drizzle
          .insert(UsersTable)
          .values({
            ...userInfo,
            balance: 0,
            activationLink,
            createdAt: new Date(),
          })
          .then(console.log);
        sendJetMail(
          userInfo.email,
          `
        If you confirm this you'll be awarded 200 coins. <br />
        Bu maili iki gun icinde onaylarsaniz  200 sahibi olursunuz. <br />

        <a href="https:/loserix.com/user/activation${activationLink}">Activation Link  Hesap onayı </a>
        <br />
        <b>1 usd = 300 game coins</b> <br />
        <br />
        To put coin on account, send <b>BTC or USDT </b> to <br />
        Hesabınıza coin eklemek için <b>BTC gönderebilirsiniz USDT </b>  <br />

        <b>BTC</b> <br />
        Bech32    bc1qq9nfrwhestdhqf4pqqy7ksnpxyads90a9l7v2tum4wuem78fah8sme7u3t<br />
        L-BTC     VJLHmQh18mStqE8G1d8ajqcMK8pfmbPLTq3Dz4ccDWSi6MQ9N4E9NfzVMt4WxjBgcHW2gkMJwvP86zyu<br />
        <br />
        <b>USDT<b> <br />
        <br />
        L-BTC     VJLHmQh18mStqE8G1d8ajqcMK8pfmbPLTq3Dz4ccDWSi6MQ9N4E9NfzVMt4WxjBgcHW2gkMJwvP86zyu<br />
        Trc20     TA7wjVPbXUjLjQFv3S24xfSnvJ9QMcHAKN<br />
        <br />
        <br />
        More payment options are in 
        <a href="https:/loserix.com/profile/payment"> payment</a><br />
Daha fazla ödeme seçenegi 
<a href="https:/loserix.com/profile/payment"> profil/ödeme </a> sayfasında yer almaktadır.

        
        `,
          `Welcome geldiniz.`
        );
        return { action: "Login link send" };
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
