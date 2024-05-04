import { ApiHandler, usePathParam } from "sst/node/api";
import { getPlayerSummaries, getPlayerSteamIdFromVanityUrl } from "./steam";
/**
 * @params - userSuppliedUrl - the url the user will give to report a player either in custom URL format or default URL format i.e.
 * If it is a custom (vanity) url it will look something like - https://steamcommunity.com/id/SOME_CUSTOM_NAME
 * If it is a default url it will look something like - https://steamcommunity.com/profiles/76561198795577738
 * @returns - SteamUser information
 */

export const handler = ApiHandler(async (_event) => {
  const path = usePathParam("steamids");
  if (!path) {
    return {
      statusCode: 400,
      body: "No steamids provided",
    };
  }
  const listOfUserSuppliedUrls = path.split(",").filter((a) => a && a.trim());
  //TODO: User Supplied URL should be regex'ed to be https://steamcommunity.com/id/* or https://steamcommmunity.com/profiles/* - remove from list if not
  //TODO: User Supplied url in frontend should send it URL encoded
  const results = await Promise.all(
    listOfUserSuppliedUrls.map(async (userSuppliedUrl) => {
      try {
        const urlObject = new URL(userSuppliedUrl);
        if (urlObject.pathname.includes("profiles/")) {
          const parts = urlObject.pathname.split("/");
          const defaultSteamId = parts[2];
          const playerData = await getPlayerSummaries(defaultSteamId);
          if (typeof playerData === "string") {
            return `No profile was found with steam id ${defaultSteamId}`;
          }
          return playerData;
        } else if (urlObject.pathname.includes("id/")) {
          const parts = urlObject.pathname.split("/");
          const customVanityUrl = parts[2];
          const playerSteamId = await getPlayerSteamIdFromVanityUrl(
            customVanityUrl
          );
          const playerData = await getPlayerSummaries(playerSteamId.toString());
          return playerData;
        }
      } catch (error) {
        console.error(error);
        throw new Error("Invalid URL Supplied");
      }
    })
  );
  return {
    body: JSON.stringify(results),
  };
});
