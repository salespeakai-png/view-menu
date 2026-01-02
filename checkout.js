/* ===============================
   CHECKOUT – FINAL FIXED
   =============================== */

const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "barfmalai";

const cart = JSON.parse(localStorage.getItem("cart") || "[]");

const orderItemsDiv = document.getElementById("orderItems");
const orderTotalSpan = document.getElementById("orderTotal");

let total = 0;

/* ===============================
   RENDER ORDER ITEMS
   =============================== */

orderItemsDiv.innerHTML = "";

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
      <div style="display:flex;justify-content:space-between;width:100%">
        <span style="font-weight:600">
          ${item.name} × ${item.qty}
        </span>
        <span style="font-weight:700">
          ₹${itemTotal}
        </span>
      </div>
    `;
    orderItemsDiv.appendChild(div);
  });
}

orderTotalSpan.innerText = total;

/* ===============================
   CONFIRM ORDER
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

  console.log("ORDER:", order);

  alert("Order placed successfully!");
  localStorage.removeItem("cart");
  location.href = "menu.html?slug=" + slug;
}
