import { GetSteamUser, users } from "@drizzle-sst/web/drizzle";
import { db } from "@drizzle-sst/web/drizzle";
import { eq } from "drizzle-orm";
import axios from "axios";

const steamApiEndpoint = (
  interfaceName: string,
  method: string,
  version: string
): string => {
  const endpoint = `http://api.steampowered.com/${interfaceName}/${method}/${version}/?key=${process.env.STEAM_API_KEY}`;
  return endpoint;
};

const getPlayerSummaries = async (steamId: string): Promise<GetSteamUser> => {
  const endpoint =
    steamApiEndpoint("ISteamUser", "GetPlayerSummaries", "v0002") +
    `&steamids=${steamId}`;
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.steamId, steamId),
    });

    if (existingUser) {
      return existingUser;
    }

    //If new User, call Steam API, and create them in database
    const res = await axios.get(endpoint);
    if (!res) {
      console.error(res);
      throw new Error("Some error to do with Steam API");
    }
    let playerData = res.data.response.players[0];
    if (playerData.length === 0) {
      throw new Error("No player found in Steam API");
    }
    const newUser = await db
      .insert(users)
      .values({
        steamId: steamId,
        personaName: playerData.personaname,
        profileUrl: playerData.profileurl,
        avatar: playerData.avatar,
        downvotes: 0,
        createdAt: Date.now(),
      })
      .returning();
    return newUser[0];
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong in DB..");
  }
};

const getPlayerSteamIdFromVanityUrl = async (
  vanityUrl: string
): Promise<number> => {
  const endpoint =
    steamApiEndpoint("ISteamUser", "ResolveVanityURL", "v0001") +
    `&vanityurl=${vanityUrl}`;
  try {
    const res = await axios.get(endpoint);
    if (!res) {
      throw new Error("Some error");
    }
    if (res.data.response.message === "No match") {
      throw new Error("No match - Steam API");
    }
    const steamId: number = res.data.response.steamid;
    return steamId;
  } catch (error) {
    console.error(error);
    throw new Error(`No profile was found with vanity url ${vanityUrl}`);
  }
};

export { getPlayerSummaries, getPlayerSteamIdFromVanityUrl };
