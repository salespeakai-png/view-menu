/* ===============================
   CHECKOUT – FINAL FRONTEND ONLY
   GitHub Pages + Offline Safe
   =============================== */

const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "barfmalai";

const cart = JSON.parse(localStorage.getItem("cart") || "[]");

const orderItemsDiv = document.getElementById("orderItems");
const orderTotalSpan = document.getElementById("orderTotal");

let total = 0;

/* ===============================
   RENDER CART ITEMS
   =============================== */

if (!cart.length) {
  orderItemsDiv.innerHTML =
    "<p style='opacity:.7'>No items in cart</p>";
} else {
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "order-item";
    div.innerHTML = `
      <span>${item.name} × ${item.qty}</span>
      <span>₹${itemTotal}</span>
    `;
    orderItemsDiv.appendChild(div);
  });
}

orderTotalSpan.innerText = total;

/* ===============================
   CONFIRM ORDER (NO API)
   =============================== */

function confirmOrder() {
  if (!cart.length) {
    alert("Cart empty");
    return;
  }

  const order = {
    slug,
    items: cart,
    total,
    order_type: document.getElementById("orderType").value,
    customer_name: document.getElementById("custName").value || "",
    customer_mobile: document.getElementById("custMobile").value || "",
    time: new Date().toLocaleString()
  };

  console.log("ORDER DATA:", order);

  alert("Order placed successfully!");

  localStorage.removeItem("cart");
  location.href = "menu.html?slug=" + slug;
}
