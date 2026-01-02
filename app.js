/* ===============================
   BARF MALAI – FINAL STABLE APP.JS
   (NO CACHE / NO SW / NO FREEZE)
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
   FETCH MENU (SIMPLE & SAFE)
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

    if (data.error) {
      throw new Error(data.error);
    }

    initMenu(data);

  } catch (err) {
    document.body.innerHTML = `
      <div style="text-align:center;color:#f5d27a;margin-top:40px">
        Unable to load menu.<br>
        Please check internet connection.
      </div>
    `;
    console.error("Menu load failed:", err);
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
  productsDiv.innerHTML = "";
  productsDiv.style.opacity = 0;

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
        onload="this.classList.add('loaded')"
        onerror="this.src='assets/placeholder.png';this.classList.add('loaded')"
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
    productsDiv.style.transition = "opacity .3s ease";
    productsDiv.style.opacity = 1;
  });
}

/* ===============================
   START
   =============================== */
loadMenu();
