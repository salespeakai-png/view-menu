/* ===============================
   DIGITAL MENU – FINAL PRODUCTION
   =============================== */

/* ---------- DOM READY ---------- */
document.addEventListener("DOMContentLoaded", () => {
  boot();
});

/* ---------- BOOT ---------- */
function boot() {
  setTimeout(loadMenu, 50); // mobile safety
}

/* ---------- SLUG ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- API (CACHE SAFE) ---------- */
const API_URL =
  "https://script.google.com/macros/s/AKfycbxC1ntR-pFyjgjROeeyyI-Pa93KlF-DLNChJSS2MGQ6cCTIQSPznzH_VBaQPUOlBHb3/exec" +
  "?slug=" + encodeURIComponent(slug) +
  "&_=" + Date.now();

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);

const menuBox = $("menu");
const menuLogo = $("menuLogo");
const menuName = $("menuName");
const categoriesDiv = $("categories");
const productsDiv = $("products");
const skeletonsDiv = $("skeletons");

/* ---------- STATE ---------- */
let CART_ENABLED = false;
let cart = [];
let PRODUCT_MAP = {};

/* ---------- UTILS ---------- */
const norm = v => String(v ?? "").trim().toLowerCase();

/* ===============================
   SKELETON
   =============================== */
function showSkeletons(count = 4) {
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
      </div>`;
  }
}

function hideSkeletons() {
  skeletonsDiv.style.display = "none";
  skeletonsDiv.innerHTML = "";
}

/* ===============================
   LOAD MENU (HARD SAFE)
   =============================== */
async function loadMenu() {
  showSkeletons();

  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });

    const data = await res.json();

    if (data?.error === "MENU_OFF") {
      location.href = "menu-off.html?slug=" + slug;
      return;
    }

    if (!data || data.error) throw "Invalid API";

    initMenu(data);

  } catch (e) {
    console.error("MENU LOAD FAILED:", e);
    skeletonsDiv.innerHTML =
      "<p style='color:#fff;text-align:center'>Menu unavailable</p>";
  }
}

/* ===============================
   INIT MENU (FINAL SAFE)
   =============================== */
function initMenu(data) {
  hideSkeletons();

  const r = data.restaurant || {};

  menuLogo.src = r.logo_url || "assets/logo1.png";
  menuLogo.onerror = () => (menuLogo.src = "assets/logo1.png");
  menuName.innerText = r.name || "Menu";

  CART_ENABLED = ["phase2", "phase3"].includes(norm(r.plan));

  PRODUCT_MAP = {};
  (data.products || []).forEach(p => PRODUCT_MAP[p.id] = p);

  renderCategories(data.categories || [], data.products || []);

  if (CART_ENABLED) initCartBar();

  // 🔥 FORCE SHOW MENU (NO BLANK)
  requestAnimationFrame(() => {
    menuBox.style.display = "block";
  });

  initBannerSlider();
}

/* ===============================
   CATEGORIES
   =============================== */
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

/* ===============================
   PRODUCTS
   =============================== */
function renderProducts(category, products) {
  productsDiv.innerHTML = "";

  const cid = norm(category.id);
  const cname = norm(category.name);

  const list = products.filter(p => {
    const pc = norm(p.categoryId || p.category_id || p.category);
    return pc === cid || pc === cname;
  });

  if (!list.length) {
    productsDiv.innerHTML = "<p>No products</p>";
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="${p.image}"
           loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.src='assets/placeholder.png'">

      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.desc || ""}</p>

        <div class="price-row">
          <span class="price">₹${p.price}</span>
          ${
            CART_ENABLED
              ? `<div class="qty">
                   <button onclick="changeQty(${p.id},-1)">−</button>
                   <span id="q_${p.id}">0</span>
                   <button onclick="changeQty(${p.id},1)">+</button>
                 </div>`
              : ""
          }
        </div>
      </div>`;

    productsDiv.appendChild(card);
  });
}

/* ===============================
   CART
   =============================== */
window.changeQty = function (id, diff) {
  const p = PRODUCT_MAP[id];
  if (!p) return;

  let item = cart.find(i => i.id === id);

  if (!item && diff > 0) {
    cart.push({ id:p.id, name:p.name, price:+p.price, qty:1 });
  } else if (item) {
    item.qty += diff;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  }

  $("q_" + id).innerText = cart.find(i => i.id === id)?.qty || 0;
  updateCartBar();
};

function initCartBar() {
  if ($("cartBar")) return;

  const bar = document.createElement("div");
  bar.id = "cartBar";
  bar.innerHTML = `
    <span id="cartText">0 items</span>
    <button onclick="goCheckout()">Checkout</button>`;
  document.body.appendChild(bar);
}

function updateCartBar() {
  const bar = $("cartBar");
  const total = cart.reduce((s,i)=>s+i.qty,0);
  bar.style.display = total ? "flex" : "none";
  $("cartText").innerText = total + " items";
}

window.goCheckout = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
  location.href = "checkout.html?slug=" + slug;
};

/* ===============================
   BANNER SLIDER
   =============================== */
function initBannerSlider() {
  const banners = document.querySelectorAll(".banner-img");
  if (banners.length <= 1) return;

  let i = 0;
  setInterval(() => {
    banners[i].classList.remove("active");
    i = (i + 1) % banners.length;
    banners[i].classList.add("active");
  }, 3500);
}
