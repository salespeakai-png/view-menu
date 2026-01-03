/* ===============================
   DIGITAL MENU – FINAL PRODUCTION
   =============================== */

/* ---------- SLUG ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- API ---------- */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" +
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

/* ---------- CART ---------- */
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
  skeletonsDiv.style.display = "flex";

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
   LOAD MENU
   =============================== */
async function loadMenu() {
  showSkeletons();

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    if (data?.error === "MENU_OFF") {
      location.href = "menu-off.html?slug=" + slug;
      return;
    }

    initMenu(data);
  } catch (err) {
    console.error("MENU ERROR:", err);
    loadingText.innerText = "Failed to load menu";
    hideSkeletons();
  }
}

/* ===============================
   INIT MENU
   =============================== */
function initMenu(data) {
  hideSkeletons();
  loadingText.remove();
  menuBox.style.display = "block";

  const r = data.restaurant || {};

  menuLogo.src = r.logo_url || "assets/logo1.png";
  menuLogo.onerror = () => (menuLogo.src = "assets/logo1.png");
  menuName.innerText = r.name || "Menu";

  CART_ENABLED = ["phase2", "phase3"].includes(norm(r.plan));

  renderCategories(data.categories || [], data.products || []);
  if (CART_ENABLED) initCartBar();
}

/* ===============================
   CATEGORIES
   =============================== */
function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

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
    const pc = norm(p.categoryId) || norm(p.category);
    return pc === cid || pc === cname;
  });

  list.forEach(p => {
    PRODUCT_MAP[p.id] = p;

    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="${p.image}" loading="lazy"
           onerror="this.src='assets/placeholder.png'">

      <div class="product-info">
        <div class="product-title">
          <img class="veg-icon"
               src="assets/${norm(p.veg)==='nonveg'?'nonveg':'veg'}.png">
          <h3>${p.name}</h3>
        </div>

        <p>${p.desc || ""}</p>

        <div class="price-row">
          <span class="price">₹${p.price}</span>

          ${
            CART_ENABLED ? `
            <div class="qty">
              <button onclick="changeQty(${p.id},-1)">−</button>
              <span id="q_${p.id}">0</span>
              <button onclick="changeQty(${p.id},1)">+</button>
            </div>` : ""
          }
        </div>
      </div>
    `;

    productsDiv.appendChild(card);
  });
}

/* ===============================
   CART LOGIC
   =============================== */
window.changeQty = function(id, diff) {
  let item = cart.find(i => i.id === id);

  if (!item && diff > 0) {
    const p = PRODUCT_MAP[id];
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
  const bar = document.createElement("div");
  bar.id = "cartBar";
  bar.innerHTML = `
    <span id="cartText">0 items</span>
    <button onclick="goCheckout()">Checkout</button>`;
  document.body.appendChild(bar);
}

function updateCartBar() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const bar = document.getElementById("cartBar");
  bar.style.display = total ? "flex" : "none";
  $("cartText").innerText = total + " items";
}

window.goCheckout = function() {
  localStorage.setItem("cart", JSON.stringify(cart));
  location.href = "checkout.html?slug=" + slug;
};

/* ===============================
   START
   =============================== */
loadMenu();
