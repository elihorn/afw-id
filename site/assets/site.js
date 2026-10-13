// Mobile menu
document.querySelector("[data-menu-toggle]")?.addEventListener("click", () => {
  document.body.classList.toggle("menu-open");
});

// Light / dark switch (remembered per browser). The knob position is CSS; this keeps aria-checked in step.
(() => {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  const root = document.documentElement;
  const current = () => root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const sync = () => toggle.setAttribute("aria-checked", String(current() === "dark"));
  sync();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync);
  toggle.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
  });
})();

// Version dropdown: open the same page in the chosen version, or its home page if that page does not exist there
(() => {
  const select = document.querySelector("[data-version-select]");
  if (!select) return;
  const from = select.value;
  select.addEventListener("change", async () => {
    const to = select.value;
    const rest = location.pathname.startsWith(from) ? location.pathname.slice(from.length) : "";
    const target = to + rest;
    try {
      const res = await fetch(target, { method: "HEAD" });
      location.href = res.ok ? target + location.hash : to;
    } catch (e) {
      location.href = to;
    }
  });
})();

// Fit text to the width of its line (.fit-width): measure at 100px, then scale.
// The negative side margins (--fit-overhang, in em) let the text run that far past each edge.
(() => {
  const els = [...document.querySelectorAll(".fit-width")];
  if (!els.length) return;
  const fit = () =>
    els.forEach((el) => {
      el.style.fontSize = "100px";
      const cs = getComputedStyle(el);
      const m = -(parseFloat(cs.marginLeft) + parseFloat(cs.marginRight)) / 100; // overhang, both sides, in em
      const line = el.clientWidth - m * 100; // the line width without the overhang
      const range = document.createRange();
      range.selectNodeContents(el);
      const w = range.getBoundingClientRect().width / 100; // text width in em
      if (w > m) el.style.fontSize = `${line / (w - m)}px`;
    });
  fit();
  document.fonts?.ready.then(fit);
  addEventListener("resize", fit);
})();

// Section links: list this page's h2 headings under its sidebar link
(() => {
  const link = document.querySelector('.nav a[aria-current="page"]');
  const heads = [...document.querySelectorAll(".content h2[id]")];
  if (!link || heads.length < 2) return;
  const ul = document.createElement("ul");
  ul.className = "toc";
  for (const h of heads) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.append(a);
    ul.append(li);
  }
  link.insertAdjacentElement("afterend", ul);
  ul.addEventListener("click", (e) => {
    if (e.target.closest("a")) document.body.classList.remove("menu-open");
  });
})();

// Lightbox for gallery images
(() => {
  const dialog = document.querySelector(".lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const img = dialog.querySelector("img");
  const caption = dialog.querySelector(".lightbox__caption");
  let set = [];
  let index = 0;

  const show = (i) => {
    index = (i + set.length) % set.length;
    const a = set[index];
    img.src = a.href;
    img.alt = a.querySelector("img")?.alt || "";
    caption.textContent = `${index + 1} / ${set.length}   ${img.alt}`;
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest(".gallery a");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    set = [...a.closest(".gallery").querySelectorAll("a")];
    show(set.indexOf(a));
    dialog.showModal();
  });

  dialog.addEventListener("click", (e) => {
    if (e.target.closest("[data-prev]")) return show(index - 1);
    if (e.target.closest("[data-next]")) return show(index + 1);
    if (e.target.closest("[data-close]") || e.target === dialog) dialog.close();
  });

  document.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
