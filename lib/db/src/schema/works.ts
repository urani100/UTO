import {
  pgTable,
  text,
  uuid,
  jsonb,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const worksTable = pgTable(
  "works",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Untitled"),
    shape: text("shape").notNull(),
    state: jsonb("state").notNull(),
    schemaVer: integer("schema_ver").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userUpdatedIdx: index("works_user_updated_idx").on(
      t.userId,
      t.updatedAt.desc(),
    ),
  }),
);

export type Work = typeof worksTable.$inferSelect;
export type InsertWork = typeof worksTable.$inferInsert;
