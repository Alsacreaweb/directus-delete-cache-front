import fs from "fs";

export default function registerHook({ action }, { env, logger }) {
  const mapCollectionsToCacheKeys = {
    information_general: "/items/information_general",
    page_accueil: "/items/page_accueil",
    page_la_meute: "page_la_meute",
    page_spectacles: "/items/page_spectacles",
    page_agenda: "/items/page_agenda",
    page_galerie: "/items/page_galerie",
    page_contact: "/items/page_contact",
    nos_spectacles: "/items/nos_spectacles",
    date_de_spectacles: "/items/date_de_spectacles",
    les_artistes: "/items/les_artistes",
  };

  const événements = ["items.create", "items.update", "items.delete"];

  const NEXT_CACHE_SECRET =
    process.env.NEXT_CACHE_SECRET ??
    fs
      .readFileSync("/run/secrets/LESDEMUSELEES-UAT-NEXT_CACHE_SECRET", "utf8") // Is't for Docker secret management
      .trim();

  const purgeCache = async (cacheKey) => {
    try {
      console.log(
        `[CACHE] Purge de la clé "${cacheKey}" ${env.NEXTJS_URL}/api/clear-cache`
      );
      const response = await fetch(`${env.NEXTJS_URL}/api/clear-cache`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NEXT_CACHE_SECRET}`,
        },
        body: JSON.stringify({ key: cacheKey }),
      });

      const data = await response.json();

      if (response.ok) {
        logger.info(`[CACHE] Clé "${cacheKey}" purgée avec succès`);
      } else {
        logger.warn(`[CACHE] Échec purge clé "${cacheKey}" : ${data.message}`);
      }
    } catch (err) {
      logger.error(
        `[CACHE] Erreur lors de la purge "${cacheKey}" : ${err.message}`
      );
    }
  };

  for (const event of événements) {
    action(event, async ({ collection }) => {
      const cacheKey = mapCollectionsToCacheKeys[collection];
      if (cacheKey) {
        await purgeCache(cacheKey);
      }
    });
  }
}
