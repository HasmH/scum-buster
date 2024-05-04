import { ApiHandler, usePathParam } from "sst/node/api";
import { migrate } from "@drizzle-sst/web/drizzle";
import { GetSteamUser, users } from "../../web/drizzle/schema";
import { db } from "@drizzle-sst/web/drizzle";
import { eq } from "drizzle-orm";
import { getPlayerSummaries, getPlayerSteamIdFromVanityUrl } from "./steam";

export const handler = ApiHandler(async (_event) => {
  const param = usePathParam("steamid");
  if (!param) {
    return {
      statusCode: 400,
      body: "No steamids provided",
    };
  }
  const existingUser = await db.query.users.findFirst({
    where: eq(users.steamId, param),
  });
  if (existingUser) {
    const updatedUser = await db
      .update(users)
      .set({ downvotes: existingUser.downvotes + 1 })
      .where(eq(users.steamId, existingUser.steamId))
      .returning();

    return {
      body: JSON.stringify(updatedUser),
    };
  } else {
    let playerData = await getPlayerSummaries(param);
    const newUser = await db.query.users.findFirst({
      where: eq(users.steamId, playerData.steamId),
    });
    if (!newUser) {
      throw new Error("User not found in DB - should have been created");
    }
    const downvotedNewUser = await db
      .update(users)
      .set({ downvotes: newUser.downvotes + 1 })
      .where(eq(users.steamId, newUser.steamId))
      .returning();
    return {
      body: JSON.stringify(downvotedNewUser),
    };
  }
});
