/* ===============================
   DIGITAL MENU – PRODUCTION READY
   =============================== */

/* ---------- SLUG ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- API ---------- */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" +
  encodeURIComponent(slug);

/* ---------- DOM SAFE ---------- */
const $ = id => document.getElementById(id);

const menuBox      = $("menu");
const menuLogo     = $("menuLogo");
const menuName     = $("menuName");
const categoriesEl = $("categories");
const productsEl   = $("products");
const skeletonsEl  = $("skeletons");
const loadingText  = $("loadingText");

/* ---------- STATE ---------- */
let CART_ENABLED = false;
let cart = [];
let PRODUCT_MAP = {}; // 🔥 production fix

/* ---------- UTILS ---------- */
const norm = v => String(v ?? "").trim().toLowerCase();

/* ===============================
   SKELETON
   =============================== */
function showSkeletons(count = 4) {
  if (!skeletonsEl) return;
  skeletonsEl.innerHTML = "";
  skeletonsEl.style.display = "block";

  for (let i = 0; i < count; i++) {
    skeletonsEl.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div style="flex:1">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line price"></div>
        </div>
      </div>`;
  }
}

function hideSkeletons() {
  if (!skeletonsEl) return;
  skeletonsEl.style.display = "none";
  skeletonsEl.innerHTML = "";
}

/* ===============================
   LOAD MENU
   =============================== */
async function loadMenu() {
  try {
    if (loadingText) loadingText.style.display = "block";
    showSkeletons();

    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    if (!data || data.error) {
      if (data?.error === "MENU_OFF") {
        location.href = "menu-off.html?slug=" + slug;
        return;
      }
      throw new Error("Invalid API data");
    }

    initMenu(data);

  } catch (err) {
    console.error("MENU LOAD FAILED:", err);
    hideSkeletons();
    if (loadingText) loadingText.innerText = "Failed to load menu";
  }
}

/* ===============================
   INIT MENU
   =============================== */
function initMenu(data) {
  hideSkeletons();
  if (loadingText) loadingText.remove();
  if (menuBox) menuBox.style.display = "block";

  const r = data.restaurant || {};

  if (menuLogo) {
    menuLogo.src = r.logo_url || "assets/logo1.png";
    menuLogo.onerror = () => (menuLogo.src = "assets/logo1.png");
  }

  if (menuName) {
    menuName.innerText = r.name || "Menu";
  }

  CART_ENABLED = ["phase2", "phase3"].includes(norm(r.plan));

  // 🔥 BUILD PRODUCT MAP (IMPORTANT)
  (data.products || []).forEach(p => {
    PRODUCT_MAP[p.id] = {
      id: p.id,
      name: p.name,
      price: Number(p.price),
    };
  });

  renderCategories(data.categories || [], data.products || []);

  if (CART_ENABLED) initCartBar();
}

/* ===============================
   CATEGORIES
   =============================== */
function renderCategories(categories, products) {
  if (!categoriesEl || !productsEl) return;

  categoriesEl.innerHTML = "";

  if (!categories.length) {
    productsEl.innerHTML = "<p>No categories</p>";
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

    categoriesEl.appendChild(el);
  });

  renderProducts(categories[0], products);
}

/* ===============================
   PRODUCTS
   =============================== */
function renderProducts(category, products) {
  if (!productsEl) return;
  productsEl.innerHTML = "";

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
    productsEl.innerHTML = "<p>No products</p>";
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
        <div class="product-title">
          <img class="veg-icon"
               src="assets/${norm(p.veg) === "nonveg" ? "nonveg" : "veg"}.png">
          <h3>${p.name}</h3>
        </div>

        <p>${p.desc || ""}</p>

        <div class="price-row">
          <span class="price">₹${p.price}</span>
          ${
            CART_ENABLED ? `
            <div class="qty">
              <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
              <span class="qty-count" id="q_${p.id}">0</span>
              <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
            </div>` : ""
          }
        </div>
      </div>`;
    productsEl.appendChild(card);
  });
}

/* ===============================
   CART
   =============================== */
window.changeQty = function (id, diff) {
  let item = cart.find(i => i.id === id);

  if (!item && diff > 0) {
    const p = PRODUCT_MAP[id];
    if (!p) return;

    cart.push({ ...p, qty: 1 });
  }
  else if (item) {
    item.qty += diff;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }

  const qtyEl = document.getElementById("q_" + id);
  if (qtyEl) {
    qtyEl.innerText = cart.find(i => i.id === id)?.qty || 0;
  }

  updateCartBar();
};

/* ===============================
   CART BAR
   =============================== */
function initCartBar() {
  if (document.getElementById("cartBar")) return;

  const bar = document.createElement("div");
  bar.id = "cartBar";
  bar.innerHTML = `
    <span id="cartText">0 items</span>
    <button onclick="goCheckout()">Checkout</button>`;
  document.body.appendChild(bar);
}

function updateCartBar() {
  const bar = document.getElementById("cartBar");
  if (!bar) return;

  const total = cart.reduce((s, i) => s + i.qty, 0);
  bar.style.display = total ? "flex" : "none";
  document.getElementById("cartText").innerText = total + " items";
}

/* ===============================
   CHECKOUT
   =============================== */
window.goCheckout = function () {
  localStorage.setItem("cart", JSON.stringify(cart));
  location.href = "checkout.html?slug=" + slug;
};

/* ===============================
   START
   =============================== */
loadMenu();
