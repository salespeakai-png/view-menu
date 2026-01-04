/* =================================================
   DIGITAL MENU – PHASE 1 (VIEW ONLY)
   FINAL + STABLE + NO CACHE ISSUE
   ================================================= */

/* ---------- SLUG ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- API ---------- */
const API_URL =
  "https://script.google.com/macros/s/AKfycbxC1ntR-pFyjgjROeeyyI-Pa93KlF-DLNChJSS2MGQ6cCTIQSPznzH_VBaQPUOlBHb3/exec?slug=" +
  encodeURIComponent(slug) +
  "&t=" + Date.now(); // 🔥 cache-buster

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);

const menuLogo = $("menuLogo");
const menuName = $("menuName");
const categoriesDiv = $("categories");
const productsDiv = $("products");
const skeletonsDiv = $("skeletons");

/* =================================================
   HELPERS
   ================================================= */

const today = () => new Date().toISOString().slice(0, 10);

function isMenuActive(r) {
  if (!r) return false;
  if (r.status !== "active") return false;

  const t = today();

  if (r.paid_until && t <= r.paid_until) return true;
  if (r.trial_end && t <= r.trial_end) return true;

  return false;
}

const norm = v => String(v ?? "").trim().toLowerCase();

/* =================================================
   SKELETON
   ================================================= */

function showSkeletons(count = 4) {
  if (!skeletonsDiv) return;
  skeletonsDiv.innerHTML = "";
  skeletonsDiv.style.display = "block";

  for (let i = 0; i < count; i++) {
    skeletonsDiv.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line price"></div>
        </div>
      </div>
    `;
  }
}

function hideSkeletons() {
  if (!skeletonsDiv) return;
  skeletonsDiv.style.display = "none";
  skeletonsDiv.innerHTML = "";
}

/* =================================================
   LOAD MENU
   ================================================= */

async function loadMenu() {
  showSkeletons();

  try {
    const res = await fetch(API_URL, {
      cache: "no-store"
    });

    const data = await res.json();
    if (!data || data.error) throw "Invalid API";

    initMenu(data);

  } catch (err) {
    console.error("MENU LOAD ERROR:", err);
    hideSkeletons();
    productsDiv.innerHTML =
      "<p style='text-align:center'>Menu unavailable</p>";
  }
}

/* =================================================
   INIT MENU
   ================================================= */

function initMenu(data) {
  const r = data.restaurant || {};

  // ❌ MENU OFF
  if (!isMenuActive(r)) {
    location.href = "menu-off.html?slug=" + slug;
    return;
  }

  hideSkeletons();

  // Header
  menuLogo.src = r.logo_url || "assets/logo1.png";
  menuLogo.onerror = () => (menuLogo.src = "assets/logo1.png");
  menuName.innerText = r.name || "Menu";

  renderCategories(data.categories || [], data.products || []);
  initBannerSlider();
}

/* =================================================
   CATEGORIES
   ================================================= */

function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

  if (!categories.length) {
    productsDiv.innerHTML = "<p>No categories</p>";
    return;
  }

  categories.forEach((cat, i) => {
    const el = document.createElement("div");
    el.className = "category" + (i === 0 ? " active" : "");
    el.innerText = cat.name;

    el.onclick = () => {
      document.querySelectorAll(".category")
        .forEach(c => c.classList.remove("active"));
      el.classList.add("active");
      renderProducts(cat, products);
    };

    categoriesDiv.appendChild(el);
  });

  renderProducts(categories[0], products);
}

/* =================================================
   PRODUCTS
   ================================================= */

function renderProducts(category, products) {
  productsDiv.innerHTML = "";

  const cid = norm(category.id);
  const cname = norm(category.name);

  const list = products.filter(p => {
    const pc =
      norm(p.categoryId) ||
      norm(p.category_id) ||
      norm(p.category);
    return pc === cid || pc === cname;
  });

  if (!list.length) {
    productsDiv.innerHTML = "<p>No products</p>";
    return;
  }

  list.forEach(p => {
    const isVeg = norm(p.veg) !== "nonveg";

    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="${p.image}"
           loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.src='assets/placeholder.png'">

      <div class="product-info">
        <div class="product-title">
          <span class="veg-dot ${isVeg ? "veg" : "nonveg"}"></span>
          <h3>${p.name}</h3>
        </div>

        <p>${p.desc || ""}</p>

        <div class="price-row">
          <span class="price">₹${p.price}</span>
        </div>
      </div>
    `;

    productsDiv.appendChild(card);
  });
}

/* =================================================
   BANNER SLIDER
   ================================================= */

function initBannerSlider() {
  const banners = document.querySelectorAll(".banner-img");
  if (banners.length <= 1) return;

  let index = 0;
  setInterval(() => {
    banners[index].classList.remove("active");
    index = (index + 1) % banners.length;
    banners[index].classList.add("active");
  }, 3500);
}

/* =================================================
   START
   ================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
});
