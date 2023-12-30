import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const Games = mysqlTable("games", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  desc: text("desc"),
  capacity: int("capacity"),
  image: varchar("image", { length: 255 }),
  active: boolean("active"),
  priceEnter: int("priceEnter"),
  priceMin: int("priceMin"),
  priceMax: int("priceMax"),
  gameDuration: int("gameDuration"),
  gameRest: int("gameRest"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GameOne = typeof Games.$inferSelect;
export const GameOneDefault = {
  id: 0,
  active: false,
  capacity: 0,
  desc: "will",
  createdAt: new Date(),
  gameDuration: 6000,
  gameRest: 1000,
  image: "",
  name: "Not defined",
  priceEnter: 5,
  priceMax: 10,
  priceMin: 5,
};
