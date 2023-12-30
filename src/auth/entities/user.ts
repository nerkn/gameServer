import {
  InferInsertModel,
  InferSelectModel,
  relations,
  sql,
} from "drizzle-orm";
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
import { TokensTable } from "./tokens";
import { createSelectSchema } from "drizzle-zod";
import { ulid } from "ulidx";
// export type RoleType = "admin" | "user" | "moder";
// const roles: [RoleType, ...RoleType[]] = ["admin", "user", "moder"];
const roles = ["admin", "user", "moder"] as const;
export type RoleType = (typeof roles)[number];
export const roleEnum = mysqlEnum("role", roles);

export const UsersTable = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => ulid()),
    role: roleEnum.default("user").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 118 }).notNull(),
    image: varchar("image", { length: 255 }),
    activationId: varchar("activationLink", { length: 36 }),
    resetPasswordId: varchar("resetPasswordId", { length: 36 }),
    isActivated: boolean("isActivated").default(false).notNull(),
    isBanned: boolean("isBanned").default(false).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    balance: int("balance").default(0),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(table.email),
      createdAtIdx: index("createdAt_idx").on(table.createdAt),
      activationIdIdx: uniqueIndex("activationId_idx").on(table.activationId),
    };
  }
);

export const UsersRelations = relations(UsersTable, ({ many }) => ({
  tokens: many(TokensTable),
}));

export type User = InferSelectModel<typeof UsersTable>;
export type UserAddRole = Pick<
  InferSelectModel<typeof UsersTable>,
  "role" | "id"
>;
export type UserCreate = Pick<
  InferInsertModel<typeof UsersTable>,
  "name" | "email" | "password"
>;

export const UserZod = createSelectSchema(UsersTable, {
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.length(118),
});
