import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { Games } from "./games";

export const GameItems = mysqlTable("gameitems", {
  id: int("id").primaryKey(),
  game: int("game")
    .notNull()
    .references(() => Games.id),
  name: varchar("name", { length: 100 }).notNull(),
  desc: text("desc"),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type GameItemOne = {
  id: number;
  game: number;
  name: string;
  desc: string | null;
  image: string | null;
  createdAt: Date;
};
