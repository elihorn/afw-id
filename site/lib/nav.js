// Builds the sidebar tree from the content folder structure.
// A folder is a group; a folder with index.md is also a page.
// Order follows the names on disk (so number prefixes sort them).

import { relFromContent, dirUrl, label as labelFrom } from "./paths.js";

const byName = (a, b) => a.seg.localeCompare(b.seg, undefined, { numeric: true, sensitivity: "base" });

export function buildTree(items) {
  const root = { key: "", seg: "", label: "Home", url: "/", isPage: false, hidden: false, children: [] };
  const nodes = new Map([["", root]]);

  const ensure = (segs) => {
    let node = root;
    let key = "";
    for (const seg of segs) {
      key = key ? `${key}/${seg}` : seg;
      let next = nodes.get(key);
      if (!next) {
        next = {
          key,
          seg,
          label: labelFrom(seg),
          url: dirUrl(key.split("/")),
          isPage: false,
          hidden: seg.startsWith("_"),
          children: [],
        };
        node.children.push(next);
        nodes.set(key, next);
      }
      node = next;
    }
    return node;
  };

  for (const item of items) {
    const rel = relFromContent(item.inputPath);
    if (!rel) continue;
    const segs = rel.split("/");
    const base = segs.pop().replace(/\.[^.]+$/, "");
    const node = base === "index" ? ensure(segs) : ensure([...segs, base]);
    node.isPage = true;
    node.url = item.url || node.url;
    const data = item.data || {};
    if (data.title) node.label = data.title;
    if (data.nav === false) node.hidden = true;
  }

  const sort = (n) => {
    n.children.sort(byName);
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const visible = (n) => !n.hidden && (n.isPage || n.children.some(visible));

// Top-level groups are always open. Deeper levels open when they contain the current page.
export function navHtml(tree, current, openDepth = 1) {
  const render = (nodes, depth) => {
    const list = nodes.filter(visible);
    if (!list.length) return "";
    const lis = list.map((n) => {
      const active = n.url === current;
      const inBranch = current.startsWith(n.url);
      const open = depth < openDepth || inBranch;
      const cls = ["nav__item", n.isPage ? "" : "nav__group", inBranch ? "is-branch" : ""].filter(Boolean).join(" ");
      const head = n.isPage
        ? `<a class="nav__link" href="${esc(n.url)}"${active ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`
        : `<span class="nav__label">${esc(n.label)}</span>`;
      const kids = open ? render(n.children, depth + 1) : "";
      return `<li class="${cls}">${head}${kids}</li>`;
    });
    return `<ul class="nav__list">${lis.join("")}</ul>`;
  };
  return render(tree.children, 0);
}

// Pages in reading order (depth first), excluding hidden ones.
export function flatten(tree) {
  const out = [];
  const walk = (n) => {
    if (n.hidden) return;
    if (n.isPage) out.push(n);
    n.children.forEach(walk);
  };
  if (tree.isPage) out.push(tree);
  tree.children.forEach(walk);
  return out;
}

export function trail(tree, current) {
  const path = [];
  const find = (n) => {
    if (n.url === current && n.isPage) return true;
    for (const c of n.children) {
      path.push(c);
      if (find(c)) return true;
      path.pop();
    }
    return false;
  };
  find(tree);
  return path.map((n) => ({ label: n.label, url: n.isPage ? n.url : null }));
}

export function pager(tree, current) {
  const pages = flatten(tree);
  const i = pages.findIndex((p) => p.url === current);
  if (i === -1) return { prev: null, next: null };
  const pick = (p) => (p ? { label: p.label, url: p.url } : null);
  return { prev: pick(pages[i - 1]), next: pick(pages[i + 1]) };
}
