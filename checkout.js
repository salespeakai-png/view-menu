/* ===============================
   CHECKOUT – FINAL GOOGLE SHEET
   =============================== */

const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "barfmalai";

const cart = JSON.parse(localStorage.getItem("cart") || "[]");

const orderItemsDiv = document.getElementById("orderItems");
const orderTotalSpan = document.getElementById("orderTotal");

let total = 0;

/* ===============================
   RENDER CART
   =============================== */
orderItemsDiv.innerHTML = "";

if (!cart.length) {
  orderItemsDiv.innerHTML = "<p>No items in cart</p>";
} else {
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <span>${item.name} × ${item.qty}</span>
      <span>₹${itemTotal}</span>
    `;
    orderItemsDiv.appendChild(row);
  });
}

orderTotalSpan.innerText = total;

/* ===============================
   CONFIRM ORDER → GOOGLE SHEET
   =============================== */
async function confirmOrder() {
  const name = document.getElementById("custName").value.trim();
  const mobile = document.getElementById("custMobile").value.trim();

  if (!name || !mobile) {
    alert("Name & Mobile required");
    return;
  }

  const payload = {
    action: "createOrder",
    slug,
    customer_name: name,
    customer_mobile: mobile,
    table_no: document.getElementById("tableNo").value || "",
    order_type: document.getElementById("orderType").value,
    total,
    items: cart
  };

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
      {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (!data.success) throw "Order failed";

    localStorage.removeItem("cart");
    alert("Order placed successfully!");
    location.href = "menu.html?slug=" + slug;

  } catch (e) {
    alert("Order failed. Try again.");
  }
}
