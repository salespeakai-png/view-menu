/* ===============================
   CHECKOUT – FINAL PRODUCTION
   =============================== */

/* ---------- PARAMS ---------- */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* ---------- DOM ---------- */
const orderItemsDiv = document.getElementById("orderItems");
const orderTotalSpan = document.getElementById("orderTotal");

const custNameInput   = document.getElementById("custName");
const custMobileInput = document.getElementById("custMobile");
const tableNoInput    = document.getElementById("tableNo");
const orderTypeSelect = document.getElementById("orderType");

/* ---------- CART ---------- */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
} catch (e) {
  cart = [];
}

/* ===============================
   RENDER ORDER ITEMS
   =============================== */
let total = 0;
orderItemsDiv.innerHTML = "";

if (!Array.isArray(cart) || cart.length === 0) {
  orderItemsDiv.innerHTML =
    "<p style='opacity:.6;margin:16px'>Your cart is empty</p>";
} else {
  cart.forEach(item => {
    // 🔒 HARD SAFETY
    const name  = item.name || "Item";
    const qty   = Number(item.qty) || 0;
    const price = Number(item.price) || 0;

    const itemTotal = qty * price;
    total += itemTotal;

    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div>
        <h4>${name}</h4>
        <small>Qty: ${qty}</small>
      </div>
      <span>₹${itemTotal}</span>
    `;
    orderItemsDiv.appendChild(row);
  });
}

orderTotalSpan.innerText = total;

/* ===============================
   CONFIRM ORDER
   =============================== */
window.confirmOrder = async function () {

  const customer_name   = custNameInput.value.trim();
  const customer_mobile = custMobileInput.value.trim();
  const table_no        = tableNoInput.value.trim();
  const order_type      = orderTypeSelect.value;

  if (!customer_name || !customer_mobile) {
    alert("Customer name and mobile number are required");
    return;
  }

  if (!cart.length) {
    alert("Cart is empty");
    return;
  }

  /* ---------- FINAL PAYLOAD ---------- */
  const payload = {
    slug,
    customer_name,
    customer_mobile,
    table_no,
    order_type,
    total,
    items: cart.map(i => ({
      id: i.id,
      name: i.name,
      price: Number(i.price),
      qty: Number(i.qty),
      amount: Number(i.price) * Number(i.qty)
    })),
    time: new Date().toLocaleString()
  };

  console.log("FINAL ORDER PAYLOAD:", payload);

  /*
  🔗 FUTURE (when order API ready)
  await fetch(ORDER_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  */

  alert("Order placed successfully!");

  localStorage.removeItem("cart");
  location.href = "menu.html?slug=" + slug;
};
