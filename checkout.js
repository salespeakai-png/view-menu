const ORDER_API_URL =
  "https://script.google.com/macros/s/AKfycbxqk9GH28xsHG9PiKjQ8lkYJYJGKgF7W_Fcy2HyjwGUBIh3u1WByv3jbfSx_HT9nm-K/exec";

window.confirmOrder = async function () {

  const customer_name   = custNameInput.value.trim();
  const customer_mobile = custMobileInput.value.trim();
  const table_no        = tableNoInput.value.trim();
  const order_type      = orderTypeSelect.value;

  if (!customer_name) {
    alert("Enter customer name");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(customer_mobile)) {
    alert("Enter valid 10-digit mobile number");
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
      price: Number(i.price),
      qty: Number(i.qty),
      amount: Number(i.price) * Number(i.qty)
    }))
  };

  try {
    const res = await fetch(ORDER_API_URL, {
      method: "POST",
      mode: "no-cors", // 🔥 VERY IMPORTANT FOR APPSCRIPT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Order placed successfully!");
    localStorage.removeItem("cart");
    location.href = "menu.html?slug=" + slug;

  } catch (err) {
    alert("Order failed. Try again.");
    console.error(err);
  }
};
