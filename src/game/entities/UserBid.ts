import {
  mysqlEnum,
  mysqlTable,
  boolean,
  timestamp,
  varchar,
  index,
  uniqueIndex,
  int,
} from "drizzle-orm/mysql-core";

export const UserBid = mysqlTable("userbid", {
  id: int("id").autoincrement(),
  user: varchar("user", { length: 36 }),
  game: varchar("game", { length: 36 }),
  item: int("item"),
  amounth: int("amounth"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
