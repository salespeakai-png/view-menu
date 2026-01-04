/* ===============================
   DIGITAL MENU – FINAL PRODUCTION
   =============================== */

/* ---------- SLUG ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- API ---------- */
const API_URL =
  "https://script.google.com/macros/s/AKfycbxC1ntR-pFyjgjROeeyyI-Pa93KlF-DLNChJSS2MGQ6cCTIQSPznzH_VBaQPUOlBHb3/exec?slug=" +
  encodeURIComponent(slug);

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);

const menuBox = $("menu");
const menuLogo = $("menuLogo");
const menuName = $("menuName");
const categoriesDiv = $("categories");
const productsDiv = $("products");
const skeletonsDiv = $("skeletons");
const loadingText = $("loadingText");

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
      </div>`;
  }
}

function hideSkeletons() {
  if (!skeletonsDiv) return;
  skeletonsDiv.style.display = "none";
  skeletonsDiv.innerHTML = "";
}

/* ===============================
   LOAD MENU
   =============================== */
async function loadMenu() {
  if (loadingText) loadingText.style.display = "block";
  showSkeletons();

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    if (data?.error === "MENU_OFF") {
      location.href = "menu-off.html?slug=" + slug;
      return;
    }
    if (!data || data.error) throw new Error("Invalid API response");

    initMenu(data);

  } catch (err) {
    console.error("MENU ERROR:", err);
    hideSkeletons();
    if (loadingText) loadingText.innerText = "Failed to load menu";
  }
}

/* ===============================
   INIT MENU (FINAL FIXED)
   =============================== */
function initMenu(data) {
  // 🔒 Step 1: Clean previous state
  hideSkeletons();
  if (loadingText) loadingText.remove();

  // 🔒 Step 2: Force menu hidden before render
  if (menuBox) {
    menuBox.style.display = "none";
  }

  const r = data.restaurant || {};

  // 🔒 Step 3: Logo safe load
  if (menuLogo) {
    menuLogo.src = r.logo_url || "assets/logo1.png";
    menuLogo.onload = () => {};
    menuLogo.onerror = () => {
      menuLogo.src = "assets/logo1.png";
    };
  }

  // 🔒 Step 4: Name
  if (menuName) {
    menuName.innerText = r.name || "Menu";
  }

  // 🔒 Step 5: Cart plan check
  CART_ENABLED = ["phase2", "phase3"].includes(norm(r.plan));

  // 🔒 Step 6: Build PRODUCT MAP (critical)
  PRODUCT_MAP = {};
  (data.products || []).forEach(p => {
    PRODUCT_MAP[p.id] = p;
  });

  // 🔒 Step 7: Render categories & products FIRST
  renderCategories(data.categories || [], data.products || []);

  // 🔒 Step 8: Init cart bar AFTER render
  if (CART_ENABLED) {
    initCartBar();
  }

  // 🔥 Step 9: SHOW menu in next frame (THIS FIXES REFRESH BUG)
  requestAnimationFrame(() => {
    if (menuBox) {
      menuBox.style.display = "block";
    }
  });
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

  const isVeg = String(p.veg).toLowerCase() === "veg";

<h3>
  <span class="veg-dot ${isVeg ? 'veg' : 'nonveg'}"></span>
  ${p.name}
</h3>
   
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="${p.image}"
           loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.src='assets/placeholder.png'">

      <div class="product-info">

        <div class="product-title">
          <img class="veg-icon" src="${vegIcon}">
          <h3>${p.name}</h3>
        </div>

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
      </div>
    `;

    productsDiv.appendChild(card);
  });
}


/* ===============================
   CART LOGIC (FINAL FIX)
   =============================== */
window.changeQty = function (id, diff) {
  const p = PRODUCT_MAP[id];
  if (!p) return;

  let item = cart.find(i => i.id === id);

  if (!item && diff > 0) {
    cart.push({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      qty: 1
    });
  } else if (item) {
    item.qty += diff;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }

  document.getElementById("q_" + id).innerText =
    cart.find(i => i.id === id)?.qty || 0;

  updateCartBar();
};

/* ===============================
   CART BAR
   =============================== */
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
  if (!bar) return;

  const total = cart.reduce((s, i) => s + i.qty, 0);
  bar.style.display = total ? "flex" : "none";
  $("cartText").innerText = total + " items";
}

window.goCheckout = function () {
  localStorage.setItem("cart", JSON.stringify(cart));
  location.href = "checkout.html?slug=" + slug;
};

/* ===== IMAGE BANNER SLIDER ===== */
let bannerIndex = 0;
const banners = document.querySelectorAll(".banner-img");

if (banners.length > 1) {
  setInterval(() => {
    banners[bannerIndex].classList.remove("active");
    bannerIndex = (bannerIndex + 1) % banners.length;
    banners[bannerIndex].classList.add("active");
  }, 3500);
}


/* ===============================
   START
   =============================== */
loadMenu();












