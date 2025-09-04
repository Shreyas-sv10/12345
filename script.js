/* =======================================================
   KEERANA SHOP PRO - script.js
   Full-featured Kirana POS system with localStorage
   ======================================================= */

/* ------------------------------
   1. USERS & LOGIN
------------------------------ */
const USERS = [
  { id: 1, username: "admin", password: "1234", role: "admin" },
  { id: 2, username: "staff", password: "0000", role: "staff" }
];

let currentUser = null;

/* Login */
function login() {
  let user = document.getElementById("userid").value.trim();
  let pass = document.getElementById("password").value.trim();

  let found = USERS.find(u => u.username === user && u.password === pass);
  if (found) {
    currentUser = found;
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.querySelector(".user-name").innerText = currentUser.username;
    document.querySelector(".user-role").innerText = currentUser.role;
    renderProducts();
    renderHistory();
  } else {
    document.getElementById("login-error").innerText = "❌ Invalid credentials!";
  }
}

/* Logout */
function logout() {
  currentUser = null;
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-page").classList.remove("hidden");
  document.getElementById("userid").value = "";
  document.getElementById("password").value = "";
}

/* ------------------------------
   2. PRODUCTS
------------------------------ */
let products = JSON.parse(localStorage.getItem("products")) || [
  { id: 1, name: "Rice", price: 50, weight: "1kg", category: "Grains" },
  { id: 2, name: "Wheat", price: 40, weight: "1kg", category: "Grains" },
  { id: 3, name: "Sugar", price: 45, weight: "1kg", category: "Essentials" },
];

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function renderProducts() {
  let list = document.getElementById("products-list");
  list.innerHTML = "";

  products.forEach(p => {
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="img">🛒</div>
      <h3>${p.name}</h3>
      <div class="meta"><span class="price">₹${p.price}</span> · ${p.weight}</div>
      <div class="actions">
        <button class="btn btn-primary" onclick="addToCart(${p.id})">Add</button>
        ${
          currentUser.role === "admin"
            ? `<button class="btn btn-ghost" onclick="openEditModal(${p.id})">Edit</button>
               <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Delete</button>`
            : ""
        }
      </div>
    `;
    list.appendChild(card);
  });

  saveProducts();
}

function addProduct() {
  let name = document.getElementById("new-name").value.trim();
  let price = parseFloat(document.getElementById("new-price").value);
  let weight = document.getElementById("new-weight").value.trim();
  let category = document.getElementById("new-category").value.trim();

  if (!name || !price || !weight) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  let newP = { id: Date.now(), name, price, weight, category };
  products.push(newP);
  saveProducts();
  renderProducts();

  document.getElementById("new-name").value = "";
  document.getElementById("new-price").value = "";
  document.getElementById("new-weight").value = "";
  document.getElementById("new-category").value = "";
}

function deleteProduct(id) {
  if (confirm("Are you sure?")) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderProducts();
  }
}

/* ------------------------------
   3. EDIT PRODUCT MODAL
------------------------------ */
let editingId = null;

function openEditModal(id) {
  let modal = document.getElementById("product-modal");
  modal.classList.remove("hidden");
  let p = products.find(pr => pr.id === id);

  document.getElementById("edit-name").value = p.name;
  document.getElementById("edit-price").value = p.price;
  document.getElementById("edit-weight").value = p.weight;
  document.getElementById("edit-category").value = p.category;

  editingId = id;
}

function closeModal() {
  document.getElementById("product-modal").classList.add("hidden");
}

function saveProduct() {
  let name = document.getElementById("edit-name").value.trim();
  let price = parseFloat(document.getElementById("edit-price").value);
  let weight = document.getElementById("edit-weight").value.trim();
  let category = document.getElementById("edit-category").value.trim();

  let p = products.find(pr => pr.id === editingId);
  p.name = name;
  p.price = price;
  p.weight = weight;
  p.category = category;

  saveProducts();
  renderProducts();
  closeModal();
}

/* ------------------------------
   4. CART
------------------------------ */
let cart = [];

function addToCart(id) {
  let p = products.find(pr => pr.id === id);
  let found = cart.find(c => c.id === id);

  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...p, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  let list = document.getElementById("cart-list");
  list.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    let div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} (${item.weight})</span>
      <div class="qty">
        <button onclick="changeQty(${item.id}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <span>₹${item.price * item.qty}</span>
    `;
    list.appendChild(div);
  });

  document.getElementById("total-amount").innerText = `₹${total}`;
}

function changeQty(id, delta) {
  let item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

/* ------------------------------
   5. CUSTOMER
------------------------------ */
let currentCustomer = "";
let history = JSON.parse(localStorage.getItem("history")) || [];

function setCustomer() {
  currentCustomer = document.getElementById("customer-name").value.trim();
  document.getElementById("customer-display").innerText =
    `Customer: ${currentCustomer}`;
}

/* ------------------------------
   6. BILLING
------------------------------ */
function generateBill() {
  if (!currentCustomer) {
    alert("⚠️ Enter customer name first!");
    return;
  }
  if (cart.length === 0) {
    alert("⚠️ Cart is empty!");
    return;
  }

  let receipt = document.getElementById("receipt");
  receipt.innerHTML = `
    <div class="head">
      <h3>🧾 Keerana Shop Bill</h3>
      <span>${new Date().toLocaleString()}</span>
    </div>
    <div><strong>Customer:</strong> ${currentCustomer}</div>
    <div class="items"></div>
  `;

  let itemsDiv = receipt.querySelector(".items");
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    itemsDiv.innerHTML += `
      <div>${item.name} (${item.weight}) × ${item.qty}
      <span style="float:right">₹${item.price * item.qty}</span></div>
    `;
  });

  receipt.innerHTML += `<div class="total-line"><span>Total</span><span>₹${total}</span></div>`;

  // Save to history
  history.push({
    customer: currentCustomer,
    items: [...cart],
    total,
    date: new Date().toLocaleString(),
  });
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();

  // Reset
  clearCart();
  currentCustomer = "";
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-display").innerText = "";
}

function printBill() {
  window.print();
}

/* ------------------------------
   7. HISTORY
------------------------------ */
function renderHistory() {
  let list = document.getElementById("history-list");
  list.innerHTML = "";
  history.forEach(h => {
    let div = document.createElement("div");
    div.className = "bill-row";
    div.innerHTML = `
      <span>${h.customer} - ${h.date}</span>
      <span>₹${h.total}</span>
    `;
    list.appendChild(div);
  });
}

/* ------------------------------
   8. INIT
------------------------------ */
window.onload = function () {
  renderProducts();
  renderHistory();
  renderCart();
};
