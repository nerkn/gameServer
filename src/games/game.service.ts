import { Elysia } from "elysia";
import { db } from "@/config/db";
import { GameItems, GameOneDefault, Games } from "./entities/schema";
import { eq } from "drizzle-orm";

export const gamesState = new Elysia()
  .use(db)
  .state("Games", [GameOneDefault])
  .derive(({ store, drizzle }) => ({
    getAllRooms: async () => {
      if (store.Games.length < 2) {
        store.Games = (await drizzle.select().from(Games)).map((g) => ({
          ...g,
          active: g.active ?? false,
          capacity: g.capacity ?? 0,
          desc: g.desc ?? "",
          gameDuration: g.gameDuration ?? 600,
          gameRest: g.gameRest ?? 100,
          image: g.image ?? "",
          priceEnter: g.priceEnter ?? 5,
          priceMax: g.priceMax ?? 5,
          priceMin: g.priceMin ?? 5,
        }));
      }
      return store.Games;
    },
    getAllItems: async (roomId: string) =>
      await drizzle.select().from(GameItems).where(eq(GameItems.game, +roomId)),
  }));
