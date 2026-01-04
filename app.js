/* ===============================
   DIGITAL MENU – PHASE 1 ONLY
   =============================== */

const slug = new URLSearchParams(location.search).get("slug") || "barfmalai";

const API =
  "https://script.google.com/macros/s/AKfycbxeK9xFt9WBMqFbCLW8p8QauIHXe5CrdA0-PHcA_bNv-CzXDEtlhsw5bXMxh2OqKnQF/exec?slug=" +
  encodeURIComponent(slug);

/* DOM */
const $ = id => document.getElementById(id);
const loadingText = $("loadingText");
const menuBox = $("menu");
const menuLogo = $("menuLogo");
const menuName = $("menuName");
const categoriesDiv = $("categories");
const productsDiv = $("products");

const norm = v => String(v || "").toLowerCase().trim();

/* LOAD MENU */
async function loadMenu() {
  try {
    const res = await fetch(API, { cache: "no-store" });
    const data = await res.json();

    if (data.error === "MENU_OFF") {
      loadingText.innerText = "Menu not available";
      return;
    }

    renderMenu(data);

  } catch (e) {
    loadingText.innerText = "Failed to load menu";
    console.error(e);
  }
}

/* RENDER */
function renderMenu(data) {
  loadingText.remove();
  menuBox.style.display = "block";

  menuLogo.src = data.restaurant.logo_url || "assets/logo1.png";
  menuName.innerText = data.restaurant.name || "Menu";

  renderCategories(data.categories, data.products);
  startBanner();
}

function renderCategories(cats, products) {
  categoriesDiv.innerHTML = "";

  cats.forEach((c, i) => {
    const btn = document.createElement("div");
    btn.className = "category" + (i === 0 ? " active" : "");
    btn.innerText = c.name;

    btn.onclick = () => {
      document.querySelectorAll(".category")
        .forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(c, products);
    };

    categoriesDiv.appendChild(btn);
  });

  renderProducts(cats[0], products);
}

function renderProducts(cat, products) {
  productsDiv.innerHTML = "";

  const list = products.filter(
    p => norm(p.categoryId) === norm(cat.id)
  );

  if (!list.length) {
    productsDiv.innerHTML = "<p>No products</p>";
    return;
  }

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image || "assets/placeholder.png"}">
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.desc || ""}</p>
        <span class="price">₹${p.price}</span>
      </div>
    `;
    productsDiv.appendChild(div);
  });
}

/* BANNER SLIDER */
function startBanner() {
  const imgs = document.querySelectorAll(".banner-img");
  if (imgs.length < 2) return;

  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove("active");
    i = (i + 1) % imgs.length;
    imgs[i].classList.add("active");
  }, 3500);
}

loadMenu();
