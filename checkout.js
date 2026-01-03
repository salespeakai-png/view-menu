/* ===============================
   CHECKOUT – FINAL PRODUCTION
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

    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <small>Qty: ${item.qty}</small>
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
async function confirmOrder() {
  const name = document.getElementById("custName").value.trim();
  const mobile = document.getElementById("custMobile").value.trim();

  if (!name || !mobile) {
    alert("Name & mobile required");
    return;
  }

  const payload = {
    slug,
    customer_name: name,
    customer_mobile: mobile,
    table_no: document.getElementById("tableNo").value || "",
    order_type: document.getElementById("orderType").value,
    total,
    items: cart,
    time: new Date().toISOString()
  };

  console.log("ORDER PAYLOAD:", payload);

  // 🔥 Phase-3: yahin se Google Apps Script POST karega
  // fetch(APP_SCRIPT_ORDER_URL,{method:"POST",body:JSON.stringify(payload)})

  alert("Order placed successfully!");
  localStorage.removeItem("cart");
  location.href = "menu.html?slug=" + slug;
}
