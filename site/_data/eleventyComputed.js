import { relFromContent, pageUrl } from "../lib/paths.js";

export default {
  // URL from the folder structure, number prefixes removed (fixedPermalink for generated pages).
  permalink: (data) => {
    if (data.fixedPermalink) return data.fixedPermalink;
    const rel = relFromContent(data.page.inputPath);
    return rel ? pageUrl(rel) : false;
  },
};
