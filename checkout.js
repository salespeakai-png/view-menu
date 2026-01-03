/* ===============================
   CHECKOUT – FINAL CORS SAFE
   =============================== */

const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "barfmalai";

/* 🔗 APPS SCRIPT WEB APP URL */
const ORDER_API =
  "https://script.google.com/macros/s/AKfycbxC1ntR-pFyjgjROeeyyI-Pa93KlF-DLNChJSS2MGQ6cCTIQSPznzH_VBaQPUOlBHb3/exec";

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
} catch {
  cart = [];
}

/* ===============================
   RENDER ORDER
   =============================== */
let total = 0;
orderItemsDiv.innerHTML = "";

if (!cart.length) {
  orderItemsDiv.innerHTML =
    "<p style='opacity:.6'>Your cart is empty</p>";
} else {
  cart.forEach(i => {
    const qty = Number(i.qty) || 0;
    const price = Number(i.price) || 0;
    const amount = qty * price;
    total += amount;

    orderItemsDiv.innerHTML += `
      <div class="order-item">
        <div>
          <b>${i.name || "Item"}</b><br>
          <small>Qty: ${qty}</small>
        </div>
        <span>₹${amount}</span>
      </div>
    `;
  });
}

orderTotalSpan.innerText = total;

/* ===============================
   CONFIRM ORDER (🔥 REAL FIX)
   =============================== */
window.confirmOrder = async function () {

  const customer_name   = custNameInput.value.trim();
  const customer_mobile = custMobileInput.value.trim();
  const table_no        = tableNoInput.value.trim();
  const order_type      = orderTypeSelect.value;

  if (!customer_name) {
    alert("Customer name required");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(customer_mobile)) {
    alert("Enter valid 10 digit mobile number");
    return;
  }

  if (!cart.length || total <= 0) {
    alert("Cart is empty");
    return;
  }

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
      qty: Number(i.qty),
      price: Number(i.price),
      amount: Number(i.qty) * Number(i.price)
    }))
  };

  const url =
    ORDER_API +
    "?action=order" +
    "&slug=" + encodeURIComponent(slug) +
    "&data=" + encodeURIComponent(JSON.stringify(payload));

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
      alert("Order failed");
      console.error(data);
      return;
    }

    alert("Order placed successfully!\nOrder ID: " + data.order_id);

    localStorage.removeItem("cart");
    location.href = "menu.html?slug=" + slug;

  } catch (err) {
    alert("Network error");
    console.error(err);
  }
};

