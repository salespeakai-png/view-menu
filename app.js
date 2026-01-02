/* ===============================
   BARF MALAI – FINAL APP.JS
   SAFE + OFFLINE FRIENDLY
   =============================== */

/* 🔹 GET SLUG */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* 🔹 API */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" +
  slug;

/* 🔹 DOM */
const menuLogo = document.getElementById("menuLogo");
const menuName = document.getElementById("menuName");
const categoriesDiv = document.getElementById("categories");
const productsDiv = document.getElementById("products");
const skeletonsDiv = document.getElementById("skeletons");
const offlineMsg = document.getElementById("offlineMsg");

/* ===============================
   SKELETON
   =============================== */
function showSkeletons(count = 4) {
  skeletonsDiv.innerHTML = "";
  skeletonsDiv.style.display = "block";

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "skeleton-card";
    s.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-lines">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line price"></div>
      </div>
    `;
    skeletonsDiv.appendChild(s);
  }
}

function hideSkeletons() {
  skeletonsDiv.style.display = "none";
  skeletonsDiv.innerHTML = "";
}

/* ===============================
   SAFE FETCH (NO FREEZE)
   =============================== */
async function fetchMenu() {
  showSkeletons();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(API_URL, {
      cache: "no-store",
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await res.json();

    if (data.error === "MENU_OFF") {
      window.location.href = "menu-off.html?slug=" + slug;
      return;
    }

    if (data.error) {
      throw new Error(data.error);
    }

    offlineMsg && (offlineMsg.style.display = "none");
    initMenu(data);

  } catch (err) {
    console.warn("API failed, trying cache", err);

    /* 🔴 OFFLINE FALLBACK */
    offlineMsg && (offlineMsg.style.display = "block");

    const cache = await caches.open("barfmalai-v2");
    const cached = await cache.match(API_URL);

    if (!cached) {
      document.body.innerHTML = `
        <div style="text-align:center;color:#f5d27a;margin-top:40px">
          Menu not available offline yet.<br>
          Please connect to internet once.
        </div>
      `;
      return;
    }

    const data = await cached.json();
    initMenu(data);
  }
}

/* ===============================
   INIT MENU
   =============================== */
function initMenu(data) {
  hideSkeletons();

  const r = data.restaurant;

  menuLogo.src = r.logo_url;
  menuLogo.onerror = () => {
    menuLogo.src = "assets/placeholder.png";
  };

  menuName.innerText = r.name;

  renderCategories(data.categories, data.products);
}

/* ===============================
   CATEGORIES
   =============================== */
function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

  if (!categories || categories.length === 0) {
    categoriesDiv.innerHTML = "<p>No categories</p>";
    return;
  }

  categories.forEach((cat, index) => {
    const el = document.createElement("div");
    el.className = "category" + (index === 0 ? " active" : "");
    el.innerText = cat.name;

    el.onclick = () => {
      document
        .querySelectorAll(".category")
        .forEach(c => c.classList.remove("active"));

      el.classList.add("active");

      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });

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
  productsDiv.style.opacity = 0;
  productsDiv.innerHTML = "";

  const list = products.filter(
    p => String(p.categoryId) === String(categoryId)
  );

  if (list.length === 0) {
    productsDiv.innerHTML = "<p>No products</p>";
    productsDiv.style.opacity = 1;
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img 
        src="${p.image}"
        loading="lazy"
        onerror="this.src='assets/placeholder.png'"
      >
      <div class="product-info">
        <div class="product-title">
          <span class="veg-dot ${p.veg === "nonveg" ? "nonveg" : ""}"></span>
          <h3>${p.name}</h3>
        </div>
        <p>${p.desc || ""}</p>
        <div class="price">₹${p.price}</div>
      </div>
    `;

    productsDiv.appendChild(card);
  });

  requestAnimationFrame(() => {
    productsDiv.style.transition = "opacity .35s ease";
    productsDiv.style.opacity = 1;
  });
}

/* ===============================
   START
   =============================== */
fetchMenu();
