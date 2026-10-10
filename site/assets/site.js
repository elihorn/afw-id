// Mobile menu
document.querySelector("[data-menu-toggle]")?.addEventListener("click", () => {
  document.body.classList.toggle("menu-open");
});

// Light / dark toggle (remembered per browser)
document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
  const root = document.documentElement;
  const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

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
