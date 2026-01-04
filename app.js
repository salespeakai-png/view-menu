/* =====================================
   DIGITAL MENU – PHASE 1 (VIEW ONLY)
   NO CART • NO CHECKOUT • STABLE
   ===================================== */

/* ---------- SLUG ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- API ---------- */
const API_URL =
  "https://script.google.com/macros/s/AKfycbxC1ntR-pFyjgjROeeyyI-Pa93KlF-DLNChJSS2MGQ6cCTIQSPznzH_VBaQPUOlBHb3/exec?slug=" +
  encodeURIComponent(slug);

/* ---------- DOM ---------- */
const menuLogo = document.getElementById("menuLogo");
const menuName = document.getElementById("menuName");
const categoriesDiv = document.getElementById("categories");
const productsDiv = document.getElementById("products");
const skeletonsDiv = document.getElementById("skeletons");

/* ---------- UTILS ---------- */
const norm = v => String(v ?? "").trim().toLowerCase();

/* ---------- SKELETON ---------- */
function showSkeletons(count = 4) {
  skeletonsDiv.innerHTML = "";
  skeletonsDiv.style.display = "block";

  for (let i = 0; i < count; i++) {
    skeletonsDiv.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    `;
  }
}

function hideSkeletons() {
  skeletonsDiv.style.display = "none";
  skeletonsDiv.innerHTML = "";
}

/* ---------- LOAD MENU ---------- */
async function loadMenu() {
  showSkeletons();

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    if (!data || data.error) {
      throw new Error("Menu error");
    }

    initMenu(data);

  } catch (e) {
    console.error("MENU LOAD ERROR", e);
    hideSkeletons();
    productsDiv.innerHTML =
      "<p style='color:#fff;text-align:center'>Menu unavailable</p>";
  }
}

/* ---------- INIT MENU ---------- */
function initMenu(data) {
  hideSkeletons();

  const r = data.restaurant || {};

  menuLogo.src = r.logo_url || "assets/logo1.png";
  menuLogo.onerror = function () {
    menuLogo.src = "assets/logo1.png";
  };

  menuName.innerText = r.name || "Menu";

  renderCategories(data.categories || [], data.products || []);
  initBannerSlider();
}

/* ---------- CATEGORIES ---------- */
function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

  if (!categories.length) {
    productsDiv.innerHTML = "<p>No categories</p>";
    return;
  }

  categories.forEach((cat, index) => {
    const el = document.createElement("div");
    el.className = "category" + (index === 0 ? " active" : "");
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

/* ---------- PRODUCTS ---------- */
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
    productsDiv.innerHTML =
      "<p style='color:#fff'>No products</p>";
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
        <div class="price">₹${p.price}</div>
      </div>
    `;

    productsDiv.appendChild(card);
  });
}

/* ---------- BANNER SLIDER ---------- */
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

/* ---------- START ---------- */
document.addEventListener("DOMContentLoaded", loadMenu);
