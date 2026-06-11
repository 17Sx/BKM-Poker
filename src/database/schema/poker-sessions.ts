import { sql } from "drizzle-orm";
import { index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const pokerSessions = pgTable(
  "poker_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    buyIn: numeric("buy_in", { precision: 10, scale: 2 }).notNull(),
    cashOut: numeric("cash_out", { precision: 10, scale: 2 }).notNull(),
    duration: numeric("duration", { precision: 5, scale: 2 }).notNull(),
    notes: text("notes"),
    gameType: text("game_type"),
    location: text("location"),
    blinds: text("blinds"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`timezone('utc'::text, now())`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`timezone('utc'::text, now())`),
  },
  (table) => ({
    userIdIdx: index("poker_sessions_user_id_idx").on(table.userId),
    createdAtIdx: index("poker_sessions_created_at_idx").on(table.createdAt),
  })
);
