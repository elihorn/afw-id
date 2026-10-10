import { relFromContent, pageUrl } from "../lib/paths.js";

export default {
  // URL from the folder structure, number prefixes removed.
  permalink: (data) => {
    const rel = relFromContent(data.page.inputPath);
    return rel ? pageUrl(rel) : false;
  },
};
