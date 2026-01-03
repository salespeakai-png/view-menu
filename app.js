/* ==================================================
   DIGITAL MENU – FINAL ALL PHASE APP.JS
   PHASE 1 / 2 / 3 – ONE FILE
   ================================================== */

/* ---------- SLUG ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- API ---------- */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" +
  encodeURIComponent(slug);

/* ---------- DOM ---------- */
const menuLogo = document.getElementById("menuLogo");
const menuName = document.getElementById("menuName");
const categoriesDiv = document.getElementById("categories");
const productsDiv = document.getElementById("products");
const skeletonsDiv = document.getElementById("skeletons");
const loadingText = document.getElementById("loadingText");

/* ---------- STATE ---------- */
let PLAN = "phase1";
let cart = [];

/* ---------- UTILS ---------- */
const norm = v => String(v ?? "").trim().toLowerCase();

/* ==================================================
   SKELETON
   ================================================== */
function showSkeletons(count = 4) {
  skeletonsDiv.style.display = "flex";
  skeletonsDiv.innerHTML = "";
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

/* ==================================================
   LOAD MENU
   ================================================== */
async function loadMenu() {
  showSkeletons();

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    if (data?.error === "MENU_OFF") {
      location.href = "menu-off.html?slug=" + slug;
      return;
    }

    if (data?.error) throw data.error;

    initMenu(data);
  } catch (e) {
    console.error("MENU LOAD ERROR:", e);
    loadingText.innerText = "Unable to load menu";
  }
}

/* ==================================================
   INIT MENU
   ================================================== */
function initMenu(data) {
  hideSkeletons();
  loadingText?.remove();

  const r = data.restaurant || {};

  menuLogo.src = r.logo_url || "assets/logo1.png";
  menuLogo.onerror = () => (menuLogo.src = "assets/logo1.png");
  menuName.innerText = r.name || "Menu";

  PLAN = norm(r.plan || "phase1");

  renderCategories(data.categories || [], data.products || []);

  if (PLAN !== "phase1") initCartBar();
}

/* ==================================================
   CATEGORIES
   ================================================== */
function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

  if (!categories.length) {
    productsDiv.innerHTML = "<p style='color:#fff'>No categories</p>";
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

/* ==================================================
   PRODUCTS
   ================================================== */
function renderProducts(category, products) {
  productsDiv.innerHTML = "";

  const cid = norm(category.id);
  const cname = norm(category.name);

  const list = products.filter(p => {
    const pid = norm(p.category_id || p.categoryId || p.category);
    return pid === cid || pid === cname;
  });

  if (!list.length) {
    productsDiv.innerHTML = "<p style='color:#fff'>No products</p>";
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="${p.image || "assets/placeholder.png"}"
           onload="this.classList.add('loaded')">
      <div class="product-info">
        <div class="product-title">
          <img class="veg-icon"
               src="assets/${norm(p.veg)==="nonveg"?"nonveg":"veg"}.png">
          <h3>${p.name}</h3>
        </div>
        <p>${p.desc || ""}</p>
        <div class="price-row">
          <span class="price">₹${p.price}</span>
          ${PLAN !== "phase1" ? `
          <div class="qty">
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
            <span class="qty-count" id="q_${p.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
          </div>` : ""}
        </div>
      </div>
    `;

    productsDiv.appendChild(card);
  });
}

/* ==================================================
   CART LOGIC (PHASE 2 / 3)
   ================================================== */
window.changeQty = function(id, diff) {
  let item = cart.find(i => i.id === id);

  if (!item && diff > 0) {
    const card = document.getElementById("q_" + id).closest(".product");
    cart.push({
      id,
      name: card.querySelector("h3").innerText,
      price: parseInt(card.querySelector(".price").innerText.replace("₹","")),
      qty: 1
    });
  } else if (item) {
    item.qty += diff;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  }

  document.getElementById("q_" + id).innerText =
    cart.find(i => i.id === id)?.qty || 0;

  updateCartBar();
};

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
  const total = cart.reduce((s,i)=>s+i.qty,0);
  bar.style.display = total ? "flex" : "none";
  document.getElementById("cartText").innerText = total + " items";
}

window.goCheckout = function() {
  localStorage.setItem("cart", JSON.stringify(cart));
  location.href = "checkout.html?slug=" + slug;
};

/* ==================================================
   START
   ================================================== */
loadMenu();
