/* ===============================
   BARF MALAI – FINAL STABLE APP.JS
   PHASE 1 + PHASE 2 READY
   =============================== */

/* 🔹 GET SLUG */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* 🔹 API URL */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" +
  slug;

/* 🔹 DOM */
const menuLogo = document.getElementById("menuLogo");
const menuName = document.getElementById("menuName");
const categoriesDiv = document.getElementById("categories");
const productsDiv = document.getElementById("products");
const skeletonsDiv = document.getElementById("skeletons");
const loadingText = document.getElementById("loadingText");

/* ===============================
   CART STATE (PHASE-2)
   =============================== */
let CART_ENABLED = false;
let cart = [];

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
      </div>
    `;
  }
}

function hideSkeletons() {
  if (!skeletonsDiv) return;
  skeletonsDiv.style.display = "none";
  skeletonsDiv.innerHTML = "";
}

/* ===============================
   FETCH MENU
   =============================== */
async function loadMenu() {
  showSkeletons();

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.error === "MENU_OFF") {
      window.location.href = "menu-off.html?slug=" + slug;
      return;
    }

    if (data.error) throw new Error(data.error);

    initMenu(data);
  } catch (err) {
    document.body.innerHTML = `
      <div style="text-align:center;color:#f5d27a;margin-top:40px">
        Unable to load menu.<br>
        Please check internet connection.
      </div>
    `;
    console.error(err);
  }
}

/* ===============================
   INIT MENU
   =============================== */
function initMenu(data) {
  hideSkeletons();
  loadingText && loadingText.remove();

  const r = data.restaurant;

  menuLogo.src = r.logo_url;
  menuLogo.onerror = () => (menuLogo.src = "assets/placeholder.png");
  menuName.innerText = r.name;

  /* 🔐 PLAN CHECK */
  CART_ENABLED = r.plan === "phase2" || r.plan === "phase3";

  renderCategories(data.categories, data.products);
  if (CART_ENABLED) initCartBar();
}

/* ===============================
   CATEGORIES
   =============================== */
function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

  categories.forEach((cat, index) => {
    const el = document.createElement("div");
    el.className = "category" + (index === 0 ? " active" : "");
    el.innerText = cat.name;

    el.onclick = () => {
      document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
      el.classList.add("active");
      renderProducts(cat.id, products);
    };

    categoriesDiv.appendChild(el);
  });

  renderProducts(categories[0].id, products);
}

/* ===============================
   PRODUCTS
   =============================== */
function renderProducts(categoryId, products) {
  productsDiv.innerHTML = "";
  productsDiv.style.opacity = 0;

  const list = products.filter(p => String(p.categoryId) === String(categoryId));

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="${p.image}" loading="lazy"
        onerror="this.src='assets/placeholder.png'">
      <div class="product-info">
        <div class="product-title">
          <span class="veg-dot ${p.veg === "nonveg" ? "nonveg" : ""}"></span>
          <h3>${p.name}</h3>
        </div>
        <p>${p.desc || ""}</p>
        <div class="price-row">
          <span class="price">₹${p.price}</span>
          ${
            CART_ENABLED
              ? `<div class="qty">
                   <button onclick="changeQty('${p.id}', -1)">−</button>
                   <span id="q_${p.id}">0</span>
                   <button onclick="changeQty('${p.id}', 1)">+</button>
                 </div>`
              : ""
          }
        </div>
      </div>
    `;
    productsDiv.appendChild(card);
  });

  requestAnimationFrame(() => {
    productsDiv.style.opacity = 1;
  });
}

/* ===============================
   CART LOGIC (PHASE-2)
   =============================== */
function changeQty(id, diff) {
  let item = cart.find(i => i.id === id);
  if (!item && diff > 0) {
    cart.push({ id, qty: 1 });
  } else if (item) {
    item.qty += diff;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  }

  document.getElementById("q_" + id).innerText =
    cart.find(i => i.id === id)?.qty || 0;

  updateCartBar();
}

/* ===============================
   CART BAR
   =============================== */
function initCartBar() {
  const bar = document.createElement("div");
  bar.id = "cartBar";
  bar.innerHTML = `<span id="cartText"></span><button onclick="placeOrder()">Place Order</button>`;
  document.body.appendChild(bar);
}

function updateCartBar() {
  const bar = document.getElementById("cartBar");
  if (!bar) return;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  bar.style.display = totalQty ? "flex" : "none";
  document.getElementById("cartText").innerText = `${totalQty} items in cart`;
}

/* ===============================
   PLACE ORDER (BACKEND)
   =============================== */
async function placeOrder() {
  if (!cart.length) return;

  const payload = {
    slug,
    items: cart,
    order_type: "dine-in"
  };

  const res = await fetch("http://localhost:5000/api/order/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Order failed");
    return;
  }

  alert("Order placed!");
  cart = [];
  updateCartBar();
}

/* ===============================
   START
   =============================== */
loadMenu();
