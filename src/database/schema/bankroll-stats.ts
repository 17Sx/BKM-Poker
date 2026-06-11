import { sql } from "drizzle-orm";
import { index, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const bankrollStats = pgTable(
  "bankroll_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    totalBankroll: numeric("total_bankroll", { precision: 10, scale: 2 }).notNull().default("0"),
    initialBankroll: numeric("initial_bankroll", { precision: 10, scale: 2 }).notNull().default("0"),
    monthlyProfit: numeric("monthly_profit", { precision: 10, scale: 2 }).notNull().default("0"),
    hoursPlayed: numeric("hours_played", { precision: 10, scale: 2 }).notNull().default("0"),
    winRate: numeric("win_rate", { precision: 5, scale: 2 }).notNull().default("0"),
    winningSessionsPercentage: numeric("winning_sessions_percentage", { precision: 5, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`timezone('utc'::text, now())`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`timezone('utc'::text, now())`),
  },
  (table) => ({
    userIdUnique: uniqueIndex("bankroll_stats_user_id_unique").on(table.userId),
    userIdIdx: index("bankroll_stats_user_id_idx").on(table.userId),
  })
);
