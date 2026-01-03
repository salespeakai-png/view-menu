/* ===============================
   DIGITAL MENU – FINAL STABLE
   =============================== */

const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "barfmalai";

const API_URL =
  "https://script.google.com/macros/s/AKfycbwh-eNLy81JK6AvwQQF-H7flEDANpUjHTv7Y2ubdnqGRO4IzhRf6HT1AZSzkqCqiyM8/exec?slug=" +
  encodeURIComponent(slug);

/* DOM */
const menuBox = document.getElementById("menu");
const menuLogo = document.getElementById("menuLogo");
const menuName = document.getElementById("menuName");
const categoriesDiv = document.getElementById("categories");
const productsDiv = document.getElementById("products");
const skeletonsDiv = document.getElementById("skeletons");
const loadingText = document.getElementById("loadingText");

/* helpers */
const clean = v => String(v ?? "").trim();

/* skeleton */
function showSkeletons(n=4){
  skeletonsDiv.innerHTML="";
  for(let i=0;i<n;i++){
    skeletonsDiv.innerHTML+=`
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>`;
  }
}

function hideSkeletons(){
  skeletonsDiv.innerHTML="";
}

/* load */
async function loadMenu(){
  showSkeletons();
  try{
    const res = await fetch(API_URL);
    const data = await res.json();

    if(data.error==="MENU_OFF"){
      location.href="menu-off.html?slug="+slug;
      return;
    }

    initMenu(data);
  }catch(e){
    loadingText.innerText="Menu failed to load";
    console.error(e);
  }
}

/* init */
function initMenu(data){
  hideSkeletons();
  loadingText.remove();
  menuBox.style.display="block";

  const r=data.restaurant||{};
  menuLogo.src=r.logo_url||"assets/placeholder.png";
  menuName.innerText=r.name||"Menu";

  renderCategories(data.categories||[],data.products||[]);
}

/* categories */
function renderCategories(categories,products){
  categoriesDiv.innerHTML="";
  categories.forEach((c,i)=>{
    const d=document.createElement("div");
    d.className="category"+(i===0?" active":"");
    d.innerText=c.name;
    d.onclick=()=>{
      document.querySelectorAll(".category").forEach(x=>x.classList.remove("active"));
      d.classList.add("active");
      renderProducts(c,products);
    };
    categoriesDiv.appendChild(d);
  });

  if(categories.length) renderProducts(categories[0],products);
}

/* products – 🔥 FIXED FILTER */
function renderProducts(category,products){
  productsDiv.innerHTML="";

  const cid = clean(category.id);

  const list = products.filter(p =>
    clean(p.category_id)===cid ||
    clean(p.categoryId)===cid
  );

  if(!list.length){
    productsDiv.innerHTML="<p style='color:#fff'>No products</p>";
    return;
  }

  list.forEach(p=>{
    const card=document.createElement("div");
    card.className="product";
    card.innerHTML=`
      <img src="${p.image||"assets/placeholder.png"}">
      <div class="product-info">
        <div class="product-title">
          <img class="veg-icon" src="assets/${p.veg==="nonveg"?"nonveg":"veg"}.png">
          <h3>${p.name}</h3>
        </div>
        <p>${p.desc||""}</p>
        <div class="price">₹${p.price}</div>
      </div>`;
    productsDiv.appendChild(card);
  });
}

loadMenu();
