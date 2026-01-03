/* ===============================
   CHECKOUT – FINAL WORKING
   =============================== */

const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "barfmalai";

/* 🔗 APPS SCRIPT WEB APP URL */
const ORDER_API =
  "https://script.google.com/macros/s/AKfycby55kKL3xgB63zajJrsT9h9b9FaGsZFv8LdYoKagE9I2g5Nf8czfk5G1ZBo9JaZRKlX/exec"; // ← apna URL daalo

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

/* ---------- RENDER ---------- */
let total = 0;
orderItemsDiv.innerHTML = "";

cart.forEach(i => {
  const qty = Number(i.qty);
  const price = Number(i.price);
  const amount = qty * price;
  total += amount;

  orderItemsDiv.innerHTML += `
    <div class="order-item">
      <div>
        <b>${i.name}</b><br>
        <small>Qty: ${qty}</small>
      </div>
      <span>₹${amount}</span>
    </div>
  `;
});

orderTotalSpan.innerText = total;

/* ===============================
   CONFIRM ORDER (🔥 REAL FIX)
   =============================== */
window.confirmOrder = async function () {

  const customer_name = custNameInput.value.trim();
  const customer_mobile = custMobileInput.value.trim();
  const table_no = tableNoInput.value.trim();
  const order_type = orderTypeSelect.value;

  /* ✅ VALIDATION */
  if (!customer_name) {
    alert("Customer name required");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(customer_mobile)) {
    alert("Enter valid 10 digit mobile number");
    return;
  }

  if (!cart.length) {
    alert("Cart is empty");
    return;
  }

  /* ---------- PAYLOAD ---------- */
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

  try {
    const res = await fetch(ORDER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.success) {
      alert("Order failed");
      console.error(data);
      return;
    }

    alert("Order placed successfully!");

    /* WhatsApp auto open (FREE) */
    if (data.customer_whatsapp) {
      window.open(data.customer_whatsapp, "_blank");
    }

    localStorage.removeItem("cart");
    location.href = "menu.html?slug=" + slug;

  } catch (err) {
    alert("Network error");
    console.error(err);
  }
};
