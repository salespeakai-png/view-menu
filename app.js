/* ===============================
   DIGITAL MENU – FINAL PRODUCTION APP.JS
   =============================== */

document.addEventListener("DOMContentLoaded", () => {

  /* 🔹 SLUG */
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || "barfmalai";

  /* 🔹 API */
  const API_URL =
    "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" +
    encodeURIComponent(slug);

  /* 🔹 DOM */
  const menuLogo = document.getElementById("menuLogo");
  const menuName = document.getElementById("menuName");
  const categoriesDiv = document.getElementById("categories");
  const productsDiv = document.getElementById("products");
  const skeletonsDiv = document.getElementById("skeletons");
  const loadingText = document.getElementById("loadingText");

  /* 🔹 CART */
  let CART_ENABLED = false;
  let cart = [];

  /* ===============================
     HELPERS
     =============================== */
  const norm = v => String(v ?? "").trim().toLowerCase();

  /* ===============================
     SKELETON
     =============================== */
  function showSkeletons(count = 4) {
    if (!skeletonsDiv) return;
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
    if (!skeletonsDiv) return;
    skeletonsDiv.style.display = "none";
    skeletonsDiv.innerHTML = "";
  }

  /* ===============================
     LOAD MENU
     =============================== */
  async function loadMenu() {
    showSkeletons();

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data?.error === "MENU_OFF") {
        location.href = "menu-off.html?slug=" + slug;
        return;
      }

      if (data?.error) throw data.error;

      initMenu(data);
    } catch (err) {
      console.error("MENU LOAD ERROR:", err);
      document.body.innerHTML =
        "<p style='text-align:center;color:#fff;margin-top:40px'>Menu load failed</p>";
    }
  }

  /* ===============================
     INIT MENU
     =============================== */
  function initMenu(data) {
    hideSkeletons();
    loadingText && loadingText.remove();

    const r = data.restaurant || {};

    /* Header */
    menuLogo.src =
      r.logo_url && r.logo_url.startsWith("http")
        ? r.logo_url
        : "assets/logo1.png";

    menuLogo.onerror = () => {
      menuLogo.src = "assets/logo1.png";
    };

    menuName.innerText = r.name || "Menu";

    CART_ENABLED = r.plan === "phase2" || r.plan === "phase3";

    renderCategories(data.categories || [], data.products || []);
    if (CART_ENABLED) initCartBar();
  }

  /* ===============================
     CATEGORIES
     =============================== */
  function renderCategories(categories, products) {
    categoriesDiv.innerHTML = "";

    if (!categories.length) {
      productsDiv.innerHTML =
        "<p style='color:#fff;margin-top:20px'>No categories</p>";
      return;
    }

    categories.forEach((cat, i) => {
      const el = document.createElement("div");
      el.className = "category" + (i === 0 ? " active" : "");
      el.textContent = cat.name;

      el.onclick = () => {
        document
          .querySelectorAll(".category")
          .forEach(c => c.classList.remove("active"));
        el.classList.add("active");
        renderProducts(cat, products);
      };

      categoriesDiv.appendChild(el);
    });

    renderProducts(categories[0], products);
  }

  /* ===============================
     PRODUCTS – FINAL SAFE LOGIC
     =============================== */
  function renderProducts(category, products) {
    productsDiv.innerHTML = "";
    productsDiv.style.opacity = 0;

    const cid = norm(category.id);
    const cname = norm(category.name);

    const list = products.filter(p => {
      const pid =
        norm(p.categoryId) ||
        norm(p.category_id) ||
        norm(p.category);
      return pid === cid || pid === cname;
    });

    if (!list.length) {
      productsDiv.innerHTML =
        "<p style='color:#fff;margin-top:20px'>No products</p>";
      productsDiv.style.opacity = 1;
      return;
    }

    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "product";

      card.innerHTML = `
        <img src="${p.image || "assets/placeholder.png"}"
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
              CART_ENABLED
                ? `<div class="qty">
                     <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
                     <span class="qty-count" id="q_${p.id}">0</span>
                     <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
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
     CART LOGIC (FULL DATA)
     =============================== */
  function changeQty(id, diff) {
    let item = cart.find(i => i.id === id);

    if (!item && diff > 0) {
      const product = document
        .querySelector(`#q_${id}`)
        ?.closest(".product");

      if (!product) return;

      cart.push({
        id,
        name: product.querySelector("h3").innerText,
        price: parseInt(
          product.querySelector(".price").innerText.replace("₹", "")
        ),
        qty: 1
      });
    } else if (item) {
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
  }

  /* ===============================
     CART BAR
     =============================== */
  function initCartBar() {
    if (document.getElementById("cartBar")) return;

    const bar = document.createElement("div");
    bar.id = "cartBar";
    bar.innerHTML = `
      <span id="cartText">0 items</span>
      <button onclick="goCheckout()">Checkout</button>
    `;
    document.body.appendChild(bar);
  }

  function updateCartBar() {
    const bar = document.getElementById("cartBar");
    if (!bar) return;

    const total = cart.reduce((s, i) => s + i.qty, 0);
    bar.style.display = total ? "flex" : "none";
    document.getElementById("cartText").innerText = `${total} items`;
  }

  /* ===============================
     CHECKOUT
     =============================== */
  function goCheckout() {
    localStorage.setItem("cart", JSON.stringify(cart));
    location.href = "checkout.html?slug=" + slug;
  }

  /* ===============================
     START
     =============================== */
  loadMenu();
});
