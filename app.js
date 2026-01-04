console.log("APP.JS LOADED ✅");

/* SLUG */
const slug =
  new URLSearchParams(window.location.search).get("slug") || "barfmalai";

/* API */
const API_URL =
  "https://script.google.com/macros/s/AKfycbxC1ntR-pFyjgjROeeyyI-Pa93KlF-DLNChJSS2MGQ6cCTIQSPznzH_VBaQPUOlBHb3/exec" +
  "?slug=" + encodeURIComponent(slug) +
  "&_=" + Date.now();

/* DOM */
const menuLogo = document.getElementById("menuLogo");
const menuName = document.getElementById("menuName");
const categoriesDiv = document.getElementById("categories");
const productsDiv = document.getElementById("products");
const skeletonsDiv = document.getElementById("skeletons");

/* UTILS */
const norm = v => String(v ?? "").trim().toLowerCase();

/* SKELETON */
function showSkeletons() {
  skeletonsDiv.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;
}

function hideSkeletons() {
  skeletonsDiv.innerHTML = "";
}

/* LOAD MENU */
async function loadMenu() {
  showSkeletons();

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    if (!data || data.error) throw "API ERROR";

    renderMenu(data);

  } catch (e) {
    console.error(e);
    menuName.innerText = "Menu unavailable";
  }
}

/* RENDER */
function renderMenu(data) {
  hideSkeletons();

  const r = data.restaurant || {};
  menuLogo.src = r.logo_url || "";
  menuName.innerText = r.name || "Menu";

  renderCategories(data.categories || [], data.products || []);
}

/* CATEGORIES */
function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

  categories.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.innerText = c.name;
    btn.onclick = () => renderProducts(c, products);
    categoriesDiv.appendChild(btn);

    if (i === 0) renderProducts(c, products);
  });
}

/* PRODUCTS */
function renderProducts(category, products) {
  productsDiv.innerHTML = "";

  const list = products.filter(p =>
    norm(p.category_id) === norm(category.id)
  );

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `<h3>${p.name}</h3><p>₹${p.price}</p>`;
    productsDiv.appendChild(div);
  });
}

/* START */
loadMenu();

