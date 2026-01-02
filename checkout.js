/* ===============================
   CHECKOUT – PHASE 2
   =============================== */

const params = new URLSearchParams(location.search);
const slug = params.get("slug");

const cart = JSON.parse(localStorage.getItem("cart") || "[]");

const orderItemsDiv = document.getElementById("orderItems");
const orderTotalSpan = document.getElementById("orderTotal");

/* RENDER ITEMS */
let total = 0;

cart.forEach(item => {
  total += item.price * item.qty;

  const div = document.createElement("div");
  div.className = "order-item";
  div.innerHTML = `
    <span>${item.name} × ${item.qty}</span>
    <span>₹${item.price * item.qty}</span>
  `;
  orderItemsDiv.appendChild(div);
});

orderTotalSpan.innerText = total;

/* CONFIRM ORDER */
async function confirmOrder() {
  if (!cart.length) {
    alert("Cart empty");
    return;
  }

  const payload = {
    slug,
    items: cart,
    total,
    order_type: document.getElementById("orderType").value,
    customer_name: document.getElementById("custName").value,
    customer_mobile: document.getElementById("custMobile").value
  };

  const res = await fetch("http://localhost:5000/api/order/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Order failed");
    return;
  }

  localStorage.removeItem("cart");
  alert("Order placed successfully!");
  location.href = "menu.html?slug=" + slug;
}
