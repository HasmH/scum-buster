import { pgTable, text, integer, bigint } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  steamId: text("steam_id").primaryKey(),
  personaName: text("persona_name"),
  profileUrl: text("profile_url").notNull(),
  avatar: text("avatar"),
  downvotes: integer("downvotes").notNull().default(0),
  createdAt: bigint("created_at", { mode: "number" }).$defaultFn(() => {
    return Date.now();
  }),
});

export type GetSteamUser = typeof users.$inferSelect;
