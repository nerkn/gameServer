import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { auth, authentication } from "@/auth/auth.controller";
import { games } from "@/games/games.routes";
import { game } from "@/game/game.routes";
const app = new Elysia()
  .use(staticPlugin({ prefix: "/" }))
  .use(games)
  .use(auth)
  .use(game)
  .use(authentication)
  .post("/sign-out", async ({ signOut }) => {
    signOut();
  });

app.listen(3333);

console.log(
  `🔥 HTTP server running at ${app.server?.hostname}:${app.server?.port}`
);
