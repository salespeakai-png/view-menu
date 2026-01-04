/* =====================================
   PHASE 3 – FINAL PREMIUM MENU LOGIC
   ===================================== */

/* 🔹 GET RESTAURANT SLUG */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* 🔹 API URL (Apps Script) */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" + slug;

/* 🔹 DOM ELEMENTS */
const menuLogo = document.getElementById("menuLogo");
const menuName = document.getElementById("menuName");
const categoriesDiv = document.getElementById("categories");
const productsDiv = document.getElementById("products");
const skeletonsDiv = document.getElementById("skeletons");
const catHint = document.querySelector(".cat-hint");

/* =====================================
   SKELETON LOADER
   ===================================== */
function showSkeletons(count = 4) {
  if (!skeletonsDiv) return;
  skeletonsDiv.innerHTML = "";

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
  if (skeletonsDiv) skeletonsDiv.innerHTML = "";
}

/* =====================================
   IMAGE LAZY LOAD OBSERVER
   ===================================== */
const imgObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => img.classList.add("loaded");
        img.onerror = () => (img.src = "assets/placeholder.png");
        imgObserver.unobserve(img);
      }
    });
  },
  { threshold: 0.2 }
);

/* =====================================
   INITIAL LOAD
   ===================================== */
showSkeletons(4);

/* =====================================
   FETCH MENU DATA
   ===================================== */
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    if (data.error === "MENU_OFF") {
      window.location.href = "menu-off.html?slug=" + slug;
      return;
    }

    if (data.error) {
      document.body.innerHTML = data.error;
      return;
    }

    initMenu(data);
  })
  .catch(() => {
    document.body.innerHTML = "Unable to load menu. Please try again.";
  });

/* =====================================
   INIT MENU
   ===================================== */
function initMenu(data) {
  const r = data.restaurant;

  /* HEADER */
  menuLogo.src = r.logo_url;
  menuLogo.onerror = () => (menuLogo.src = "assets/placeholder.png");
  menuName.innerText = r.name;

  /* 🎨 APPLY THEME COLOR FROM SHEET */
  if (r.theme_color) {
    document.documentElement.style.setProperty(
      "--theme-bg",
      r.theme_color
    );
  }

  renderCategories(data.categories, data.products);
}

/* =====================================
   RENDER CATEGORIES
   ===================================== */
function renderCategories(categories, products) {
  categoriesDiv.innerHTML = "";

  if (!categories || categories.length === 0) {
    categoriesDiv.innerHTML = "<p>No categories available</p>";
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

  /* SLIDE HINT AUTO HIDE */
  if (catHint) {
    categoriesDiv.addEventListener("scroll", () => {
      if (categoriesDiv.scrollLeft > 10) {
        catHint.style.display = "none";
      }
    });
  }

  /* MICRO AUTO SLIDE HINT */
  setTimeout(() => {
    categoriesDiv.scrollLeft = 40;
  }, 600);

  renderProducts(categories[0].id, products);
}

/* =====================================
   RENDER PRODUCTS
   ===================================== */
function renderProducts(categoryId, products) {
  /* Smooth transition */
  productsDiv.style.opacity = "0";

  setTimeout(() => {
    productsDiv.innerHTML = "";
    hideSkeletons();

    const filteredProducts = products.filter(
      p => String(p.categoryId) === String(categoryId)
    );

    if (filteredProducts.length === 0) {
      productsDiv.innerHTML = "<p>No products available</p>";
      productsDiv.style.opacity = "1";
      return;
    }

    filteredProducts.forEach(p => {
      const card = document.createElement("div");
      card.className = "product";

      card.innerHTML = `
        <img data-src="${p.image}" src="assets/placeholder.png">
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

      const img = card.querySelector("img");
      imgObserver.observe(img);
    });

    productsDiv.style.opacity = "1";
    document.getElementById("loadingText")?.remove();
  }, 120);
}

/* ================= BANNER SLIDER ================= */

document.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll(".banner-img");
  const skeleton = document.getElementById("bannerSkeleton");

  // Remove skeleton after short delay
  setTimeout(() => {
    skeleton.style.display = "none";
  }, 4300);

  // Start slider
  if (imgs.length > 1) {
    let i = 0;
    setInterval(() => {
      imgs[i].classList.remove("active");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("active");
    }, 3000);
  }
});
