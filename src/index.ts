import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { auth, authentication } from "@/auth/auth.controller";
import { games } from "@/games/games.routes";
import { game } from "@/game/game.routes";
import { mailjet } from "./libs/mailjet";
import { profile } from "./profile/profile";
const app = new Elysia()
  .use(staticPlugin({ prefix: "/" }))
  .use(mailjet)
  .get("/mailDene", async ({ sendJetMail }) => {
    console.log("basliyor");
    let r = await sendJetMail(
      "erkintek@gmail.com",
      "Umarim mesajim size ulasir"
    );
    console.log("bitiyor", r);
    return "kedi 1234";
  })
  .use(games)
  .use(auth)
  .use(game)
  .use(profile)
  .use(authentication)
  .post("/sign-out", async ({ signOut }) => {
    signOut();
  });

app.listen(3333);

console.log(
  `🔥 HTTP server running at ${app.server?.hostname}:${app.server?.port}`
);
