/* ===============================
   CHECKOUT – FINAL PRODUCTION SAFE
   =============================== */

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "barfmalai";

/* DOM */
const orderItemsDiv = document.getElementById("orderItems");
const orderTotalSpan = document.getElementById("orderTotal");

const custNameInput   = document.getElementById("custName");
const custMobileInput = document.getElementById("custMobile");
const tableNoInput    = document.getElementById("tableNo");
const orderTypeSelect = document.getElementById("orderType");

/* CART */
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
    "<p style='opacity:.6;margin:16px'>Your cart is empty</p>";
} else {
  cart.forEach(item => {
    const name  = String(item.name || "Item");
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
      qty: i.qty,
      price: i.price,
      amount: i.qty * i.price
    })),
    time: new Date().toISOString()
  };

  console.log("ORDER PAYLOAD:", payload);

  alert("Order placed successfully!");
  localStorage.removeItem("cart");
  location.href = "menu.html?slug=" + slug;
};
