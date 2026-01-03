const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "barfmalai";

const cart = JSON.parse(localStorage.getItem("cart") || "[]");

const itemsDiv = document.getElementById("orderItems");
const totalSpan = document.getElementById("orderTotal");

let total = 0;

/* RENDER ITEMS */
itemsDiv.innerHTML = "";

if (!cart.length) {
  itemsDiv.innerHTML = "<p style='opacity:.7'>Cart empty</p>";
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
    itemsDiv.appendChild(row);
  });
}

totalSpan.innerText = total;

/* CONFIRM ORDER */
async function confirmOrder() {
  const name = document.getElementById("custName").value.trim();
  const mobile = document.getElementById("custMobile").value.trim();

  if (!name || !mobile) {
    alert("Name & Mobile required");
    return;
  }

  const payload = {
    slug,
    name,
    mobile,
    table: document.getElementById("tableNo").value,
    order_type: document.getElementById("orderType").value,
    total,
    items: cart,
    time: new Date().toLocaleString()
  };

  await fetch(
    "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  localStorage.removeItem("cart");
  alert("Order placed successfully!");
  location.href = "menu.html?slug=" + slug;
}
