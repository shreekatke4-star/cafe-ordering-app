// ============================================================
//  BREW & BITES — Customer App Logic (app.js)
//  Firebase Firestore: writes orders to "orders" collection
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase Config ───────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBvvC44pFjrOA7zjdiT58FcD9jhRRpff4s",
  authDomain: "cafe-ordering-app-df3f4.firebaseapp.com",
  projectId: "cafe-ordering-app-df3f4",
  storageBucket: "cafe-ordering-app-df3f4.firebasestorage.app",
  messagingSenderId: "310742974435",
  appId: "1:310742974435:web:651ddf04f04f83c8b4ead6",
  measurementId: "G-PLBJTRKEC5"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);



// ── Menu Data ──────────────────────────────────────────────────
const MENU = [
  // Iced Coffee
  {
    id: 1, name: "Americano", category: "Iced Coffee",
    desc: "Rich espresso combined with water over ice.",
    price: 119, popular: true,
    img: "images/Americano.png"
  },
  {
    id: 2, name: "Cafe Latte", category: "Iced Coffee",
    desc: "Smooth espresso blended with creamy milk over ice.",
    price: 149, popular: true,
    img: "images/Cafe_Latte.png"
  },
  {
    id: 3, name: "Cafe Mocha", category: "Iced Coffee",
    desc: "Bold espresso, dark chocolate, and cold milk.",
    price: 169, popular: false,
    img: "images/Cafe_Mocha.png"
  },
  {
    id: 4, name: "White Mocha", category: "Iced Coffee",
    desc: "Espresso with white chocolate sauce and chilled milk.",
    price: 169, popular: false,
    img: "images/White_Mocha.png"
  },
  {
    id: 5, name: "Dark Mocha", category: "Iced Coffee",
    desc: "Signature dark chocolate meets bold espresso and ice.",
    price: 169, popular: false,
    img: "images/Dark_Mocha.png"
  },
  {
    id: 6, name: "Caramel Macchiato", category: "Iced Coffee",
    desc: "Chilled milk, vanilla syrup, espresso, and caramel drizzle.",
    price: 169, popular: true,
    img: "images/Caramel_Macchiato.png"
  },
  {
    id: 7, name: "French Vanilla Latte", category: "Iced Coffee",
    desc: "Chilled milk, rich French vanilla syrup, and espresso.",
    price: 169, popular: false,
    img: "images/French_Vanilla_Latte.png"
  },
  {
    id: 8, name: "Creamy Vanilla Latte", category: "Iced Coffee",
    desc: "Double shot espresso with creamy textured milk and vanilla.",
    price: 169, popular: false,
    img: "images/Creamy_Vanilla_Latte.png"
  },
  // Frappe
  {
    id: 9, name: "Chocolate", category: "Frappe",
    desc: "Creamy ice-blended chocolate frappe with whipped cream.",
    price: 159, popular: true,
    img: "images/Chocolate.png"
  },
  {
    id: 10, name: "Dark Choco", category: "Frappe",
    desc: "Deep, intense dark chocolate blended with ice.",
    price: 159, popular: false,
    img: "images/Dark_Choco.png"
  },
  {
    id: 11, name: "Cookies & Cream", category: "Frappe",
    desc: "Oreo cookie chunks blended with cream and ice.",
    price: 159, popular: true,
    img: "images/Cookies_and_Cream.png"
  },
  {
    id: 12, name: "Double Dutch", category: "Frappe",
    desc: "Rich chocolate blend with premium fudge chunks.",
    price: 159, popular: false,
    img: "images/Double_Dutch.png"
  },
  {
    id: 13, name: "Salted Caramel", category: "Frappe",
    desc: "Sweet caramel with a touch of sea salt, ice-blended.",
    price: 159, popular: false,
    img: "images/Salted_Caramel.png"
  },
  {
    id: 14, name: "Ube Frappe", category: "Frappe",
    desc: "A unique sweet purple yam frappe, a local favorite.",
    price: 159, popular: false,
    img: "images/Ube_Frappe.png"
  },
  {
    id: 15, name: "Rocky Road", category: "Frappe",
    desc: "Chocolate, marshmallows, and nuts blended with ice.",
    price: 159, popular: false,
    img: "images/Rocky_Road.png"
  },
  {
    id: 16, name: "Java Chip", category: "Frappe",
    desc: "Espresso, chocolate chips, and mocha sauce blended with ice.",
    price: 179, popular: true,
    img: "images/Java_Chip.png"
  },
  {
    id: 17, name: "Red Velvet", category: "Frappe",
    desc: "Decadent red velvet cake flavor blended with cream.",
    price: 179, popular: false,
    img: "images/Red_Velvet.png"
  },
  {
    id: 18, name: "Choco Mousse", category: "Frappe",
    desc: "Airy, chocolatey mousse blended smooth with ice.",
    price: 179, popular: false,
    img: "images/Choco_Mousse.png"
  },
  {
    id: 19, name: "Black Forest", category: "Frappe",
    desc: "Rich dark chocolate with sweet cherry tones.",
    price: 179, popular: false,
    img: "images/Black_Forest.png"
  },
  {
    id: 20, name: "Strawberry", category: "Frappe",
    desc: "Creamy, fruity strawberry cream blend over ice.",
    price: 179, popular: false,
    img: "images/Strawberry.png"
  },
  // Coffee Frappe
  {
    id: 21, name: "Dark Mocha Frappe", category: "Coffee Frappe",
    desc: "Chilled espresso, dark chocolate, and ice blended perfectly.",
    price: 180, popular: true,
    img: "images/Dark_Mocha_Frappe.png"
  },
  {
    id: 22, name: "White Mocha Frappe", category: "Coffee Frappe",
    desc: "Rich white chocolate mocha blended with espresso and ice.",
    price: 150, popular: false,
    img: "images/White_Mocha_Frappe.png"
  },
  {
    id: 23, name: "Caramel Macchiato Frappe", category: "Coffee Frappe",
    desc: "Sweet caramel blended with coffee, milk, and ice.",
    price: 180, popular: false,
    img: "images/Caramel_Macchiato_Frappe.png"
  },
  {
    id: 24, name: "Nata-20 Add-on", category: "Coffee Frappe",
    desc: "Chewy Nata de Coco add-on for your drinks.",
    price: 20, popular: false,
    img: "images/Nata_de_Coco.png"
  },
  {
    id: 25, name: "Coffee Jelly-25 Add-on", category: "Coffee Frappe",
    desc: "Delicious coffee jelly bits to add texture.",
    price: 25, popular: false,
    img: "images/Coffee_Jelly.png"
  },
  // Snacks
  {
    id: 26, name: "Strawberry Waffle", category: "Snacks",
    desc: "Fresh, warm waffle topped with sliced strawberries.",
    price: 299, popular: true,
    img: "images/Strawberry_Waffle.png"
  },
  {
    id: 27, name: "Cinnamon Roll", category: "Snacks",
    desc: "Warm cinnamon roll topped with rich glaze frosting.",
    price: 199, popular: false,
    img: "images/Cinnamon_Roll.png"
  },
  {
    id: 28, name: "Lemon Pie", category: "Snacks",
    desc: "Tangy lemon filling in a flaky buttery crust.",
    price: 249, popular: false,
    img: "images/Lemon_Pie.png"
  },
  {
    id: 29, name: "Croissant", category: "Snacks",
    desc: "Flaky, buttery French croissant baked daily.",
    price: 149, popular: false,
    img: "images/Croissant.png"
  },
  {
    id: 30, name: "Chocolate Waffle", category: "Snacks",
    desc: "Rich chocolate batter waffle with chocolate syrup.",
    price: 289, popular: false,
    img: "images/Chocolate_Waffle.png"
  },
  {
    id: 31, name: "Brownies", category: "Snacks",
    desc: "Dense, fudgy double chocolate brownie pieces.",
    price: 179, popular: true,
    img: "images/Brownies.png"
  },
  {
    id: 32, name: "Cheesecake", category: "Snacks",
    desc: "Creamy baked cheesecake with graham cracker crust.",
    price: 319, popular: false,
    img: "images/Cheesecake.png"
  },
  {
    id: 33, name: "Chocolate Muffin", category: "Snacks",
    desc: "Soft chocolate muffin loaded with chocolate chips.",
    price: 149, popular: false,
    img: "images/Chocolate_Muffin.png"
  }
];

const CATEGORIES = ["All", "Iced Coffee", "Frappe", "Coffee Frappe", "Snacks"];

// ── State ──────────────────────────────────────────────────────
let cart = {};           // { itemId: quantity }
let tableNo = "";
let activeCategory = "All";
let lastOrderData = null;

// ── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Get table from URL ?table=4
  const params = new URLSearchParams(window.location.search);
  tableNo = params.get("table") || "";

  // Pre-fill table input
  const tableInput = document.getElementById("table-no-input");
  if (tableInput && tableNo) tableInput.value = tableNo;

  renderCategories();
  renderFeatured();
  renderMenu("All");

  initSearch();

  // ── Hide splash screen after menu is rendered ──
  const splash = document.getElementById("splash-screen");
  if (splash) {
    setTimeout(() => {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 650);
    }, 1500);
  }
});



// ── Live Search ─────────────────────────────────────────────
let searchQuery = "";

function initSearch() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("search-clear");
  if (!input) return;

  input.addEventListener("input", () => {
    searchQuery = input.value.trim().toLowerCase();
    clearBtn.style.opacity = searchQuery ? "1" : "0";
    clearBtn.style.pointerEvents = searchQuery ? "auto" : "none";
    renderMenu(activeCategory);
    // Show all categories context when searching
    if (searchQuery) {
      document.getElementById("search-results-label").textContent =
        `Results for "${input.value.trim()}"`;
      document.getElementById("search-results-label").style.display = "block";
    } else {
      document.getElementById("search-results-label").style.display = "none";
    }
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    searchQuery = "";
    clearBtn.style.opacity = "0";
    clearBtn.style.pointerEvents = "none";
    document.getElementById("search-results-label").style.display = "none";
    renderMenu(activeCategory);
    input.focus();
  });
}

// ── Screen Navigation ──────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  target.classList.add("active");
  target.scrollTop = 0;
  window.scrollTo(0, 0);
}

window.goToCheckout = function () {
  if (cartTotal() === 0) {
    showToast("Add items to your order first!");
    return;
  }
  renderCheckoutSummary();
  showScreen("screen-checkout");
  // Hide cart bar so it doesn't cover the Place Order button
  document.getElementById("cart-bar").classList.add("hide");
};

window.goBack = function () {
  showScreen("screen-menu");
  updateCartUI(); // restore cart bar visibility if items exist
};

window.orderMore = function () {
  cart = {};
  updateCartUI();
  renderFeatured();
  renderMenu(activeCategory);
  showScreen("screen-menu");
};

// ── Categories ────────────────────────────────────────────────
const CAT_ICONS = {
  "All":
    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  "Iced Coffee":
    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  "Frappe":
    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l-1 10H9L8 2z"/><path d="M7 22h10"/><path d="M9 12v10"/><path d="M15 12v10"/></svg>`,
  "Coffee Frappe":
    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  "Snacks":
    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>`
};

function renderCategories() {
  const container = document.getElementById("category-tabs");
  container.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `pill ${cat === activeCategory ? "pill-active" : ""}`;
    btn.innerHTML = `<span>${CAT_ICONS[cat] || ""}</span>${cat}`;
    btn.setAttribute("aria-label", `Filter by ${cat}`);
    btn.onclick = () => {
      activeCategory = cat;
      renderCategories();
      renderMenu(cat);
    };
    container.appendChild(btn);
  });
}

// ── Featured Row ───────────────────────────────────────────────
// ── Featured Row ───────────────────────────────────────────────
function getItemQtyInCart(id) {
  return Object.keys(cart)
    .filter(k => k.startsWith(`${id}_`))
    .reduce((sum, k) => sum + cart[k].qty, 0);
}

function buildFeaturedCardHTML(item) {
  const qty = getItemQtyInCart(item.id);
  const controlHTML = qty === 0
    ? `<button class="add-btn-sm" onclick="event.stopPropagation();addToCart(${item.id})" aria-label="Add ${item.name}">+</button>`
    : `<div class="qty-control-sm" onclick="event.stopPropagation()">
         <button class="qty-btn-sm" onclick="removeFromCart(${item.id})">−</button>
         <span class="qty-num-sm">${qty}</span>
         <button class="qty-btn-sm" onclick="addToCart(${item.id})">+</button>
       </div>`;
  return `
    <div class="featured-card" onclick="openFoodDetail(${item.id})" style="cursor:pointer">
      <img src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="featured-card-body">
        <div class="featured-card-name">${item.name}</div>
        <div class="featured-card-bottom">
          <span class="featured-card-price">₹${item.price}</span>
          <div id="fctrl-${item.id}" onclick="event.stopPropagation()">${controlHTML}</div>
        </div>
      </div>
    </div>`;
}

function renderFeatured() {
  const container = document.getElementById("featured-row");
  const featured = MENU.filter(i => i.popular);
  container.innerHTML = featured.map(item => buildFeaturedCardHTML(item)).join("");
}

function refreshFeaturedControl(id) {
  const el = document.getElementById(`fctrl-${id}`);
  if (!el) return;
  const item = MENU.find(i => i.id === id);
  const qty = getItemQtyInCart(id);
  if (qty === 0) {
    el.innerHTML = `<button class="add-btn-sm" onclick="addToCart(${id})" aria-label="Add ${item.name}">+</button>`;
  } else {
    el.innerHTML = `
      <div class="qty-control-sm">
        <button class="qty-btn-sm" onclick="removeFromCart(${id})">−</button>
        <span class="qty-num-sm">${qty}</span>
        <button class="qty-btn-sm" onclick="addToCart(${id})">+</button>
      </div>`;
  }
}

// ── Menu List ─────────────────────────────────────────────────
function renderMenu(category) {
  const container = document.getElementById("menu-list");
  let items = category === "All" ? MENU : MENU.filter(i => i.category === category);

  // Apply live search filter
  if (searchQuery) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(searchQuery) ||
      i.desc.toLowerCase().includes(searchQuery) ||
      i.category.toLowerCase().includes(searchQuery)
    );
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div class="empty-state-text">${searchQuery ? `No results for "${searchQuery}"` : 'No items in this category'}</div>
      </div>`;
    return;
  }

  container.innerHTML = items.map(item => buildMenuItemHTML(item)).join("");
}

function buildMenuItemHTML(item) {
  const qty = getItemQtyInCart(item.id);
  const controlHTML = qty === 0
    ? `<button class="add-btn" onclick="event.stopPropagation();addToCart(${item.id})" aria-label="Add ${item.name}">+</button>`
    : `<div class="qty-control" onclick="event.stopPropagation()">
         <button class="qty-btn" onclick="removeFromCart(${item.id})" aria-label="Remove one">−</button>
         <span class="qty-num">${qty}</span>
         <button class="qty-btn" onclick="addToCart(${item.id})" aria-label="Add one more">+</button>
       </div>`;

  return `
    <div class="menu-item" id="menu-item-${item.id}" onclick="openFoodDetail(${item.id})" style="cursor:pointer">
      <div class="menu-item-img-wrap">
        <img class="menu-item-img" src="${item.img}" alt="${item.name}" loading="lazy" />
      </div>
      <div class="menu-item-info">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-desc">${item.desc}</div>
        <div class="menu-item-footer">
          <div class="menu-item-price">₹${item.price}</div>
          <div id="ctrl-${item.id}">${controlHTML}</div>
        </div>
      </div>
    </div>`;
}

// ── Cart Logic ─────────────────────────────────────────────────
// cart structure: { [cartKey]: { id, qty, milk, size } }
window.addToCart = function (id, milk, size) {
  const item = MENU.find(i => i.id === id);
  if (!item) return;

  const requiresCustomization = (item.category === "Iced Coffee" || item.category === "Frappe" || item.category === "Coffee Frappe");
  const existingKeys = Object.keys(cart).filter(k => k.startsWith(`${id}_`));

  // If added from main screen (no milk/size specified) and requires customization
  if (!milk && !size && requiresCustomization) {
    if (existingKeys.length === 0) {
      openFoodDetail(id);
      return;
    } else {
      const targetKey = existingKeys[0];
      cart[targetKey].qty++;
      refreshItemControl(id);
      refreshFeaturedControl(id);
      updateCartUI();
      showToast(`Added to cart ✓`);
      return;
    }
  }

  const defaultMilk = (item.category === "Iced Coffee" || item.category === "Coffee Frappe") ? "Classic" : null;
  const defaultSize = (item.category === "Iced Coffee" || item.category === "Frappe" || item.category === "Coffee Frappe") ? "350 mL" : null;

  const finalMilk = milk || defaultMilk;
  const finalSize = size || defaultSize;
  const cartKey = `${id}_${finalMilk || ''}_${finalSize || ''}`;

  if (cart[cartKey]) {
    cart[cartKey].qty++;
  } else {
    cart[cartKey] = { id: id, qty: 1, milk: finalMilk, size: finalSize };
  }

  refreshItemControl(id);
  refreshFeaturedControl(id);
  updateCartUI();
  showToast(`Added to cart ✓`);
};

window.addOfferToCart = function (id, offerPrice, milk, size) {
  const item = MENU.find(i => i.id === id);
  if (!item) return;

  const defaultMilk = (item.category === "Iced Coffee" || item.category === "Coffee Frappe") ? "Classic" : null;
  const defaultSize = (item.category === "Iced Coffee" || item.category === "Frappe" || item.category === "Coffee Frappe") ? "350 mL" : null;

  const finalMilk = milk || defaultMilk;
  const finalSize = size || defaultSize;
  const cartKey = `${id}_${finalMilk || ''}_${finalSize || ''}_offer`;

  if (cart[cartKey]) {
    cart[cartKey].qty++;
  } else {
    cart[cartKey] = { id: id, qty: 1, milk: finalMilk, size: finalSize, isOffer: true, offerPrice: offerPrice };
  }

  refreshItemControl(id);
  refreshFeaturedControl(id);
  updateCartUI();
  showToast(`Special Offer Added! ✓`);
};

window.removeFromCart = function (id) {
  const existingKeys = Object.keys(cart).filter(k => k.startsWith(`${id}_`));
  if (existingKeys.length === 0) return;

  const targetKey = existingKeys[existingKeys.length - 1];
  cart[targetKey].qty--;
  if (cart[targetKey].qty === 0) {
    delete cart[targetKey];
  }
  refreshItemControl(id);
  refreshFeaturedControl(id);
  updateCartUI();
};

window.removeCartItemFully = function (key) {
  if (cart[key]) {
    const id = cart[key].id;
    delete cart[key];
    refreshItemControl(id);
    refreshFeaturedControl(id);
    updateCartUI();
  }
};

function refreshItemControl(id) {
  const el = document.getElementById(`ctrl-${id}`);
  if (!el) return;
  const item = MENU.find(i => i.id === id);
  const qty = getItemQtyInCart(id);
  if (qty === 0) {
    el.innerHTML = `<button class="add-btn" onclick="addToCart(${id})" aria-label="Add ${item.name}">+</button>`;
  } else {
    el.innerHTML = `
      <div class="qty-control">
        <button class="qty-btn" onclick="removeFromCart(${id})" aria-label="Remove one">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="addToCart(${id})" aria-label="Add one more">+</button>
      </div>`;
  }
}

function getItemPrice(item, entry) {
  if (entry && entry.isOffer && entry.offerPrice) {
    return entry.offerPrice;
  }
  let price = item.price;
  if (entry) {
    // Size adjustments: ±20 for Iced Coffee, ±30 for Frappe/Coffee Frappe
    const sizeStep = item.category === "Iced Coffee" ? 20 : 30;
    if (entry.size === "280 mL") price -= sizeStep;
    if (entry.size === "450 mL") price += sizeStep;

    // Milk upcharges (same across all categories)
    if (entry.milk === "No Lactose") price += 20;
    if (entry.milk === "Coconut") price += 30;
    if (entry.milk === "Almond") price += 40;
  }
  return price;
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [key, entry]) => {
    const item = MENU.find(i => i.id === entry.id);
    return sum + (item ? getItemPrice(item, entry) * entry.qty : 0);
  }, 0);
}

function cartCount() {
  return Object.values(cart).reduce((a, entry) => a + entry.qty, 0);
}

function updateCartUI() {
  const count = cartCount();
  const subtotal = cartTotal();
  const cartBar = document.getElementById("cart-bar");
  const cartText = document.getElementById("cart-bar-text");
  const headerBadge = document.getElementById("header-cart-count");

  if (count > 0) {
    cartBar.classList.remove("hide");
    cartText.textContent = `${count} item${count > 1 ? "s" : ""}`;
    headerBadge.textContent = count;
    headerBadge.classList.remove("hidden");

    // Populate cart sheet items
    const itemsEl = document.getElementById("cart-sheet-items");
    if (itemsEl) {
      itemsEl.innerHTML = Object.entries(cart).map(([key, entry]) => {
        const item = MENU.find(i => i.id === entry.id);
        if (!item) return "";
        // Build customisation tags
        const tags = [];
        if (entry.milk) tags.push(entry.milk);
        if (entry.size) tags.push(entry.size);
        const tagsHTML = tags.length
          ? `<div class="cart-item-tags">${tags.map(t => `<span class="cart-tag">${t}</span>`).join("")}</div>`
          : "";
        return `<div class="cart-sheet-row">
          <img class="cart-thumb" src="${item.img}" alt="${item.name}" loading="lazy" />
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            ${tagsHTML}
            <div class="cart-item-qty">x${entry.qty}</div>
          </div>
          <div class="cart-item-price">₹${getItemPrice(item, entry) * entry.qty}</div>
          <button class="cart-remove-item-btn" onclick="removeCartItemFully('${key}')" aria-label="Remove ${item.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>`;
      }).join("");
    }

    // Populate cart sheet totals with GST
    const totalsEl = document.getElementById("cart-totals-box");
    if (totalsEl) {
      const gst = Math.round(subtotal * 0.05 * 100) / 100;
      const grandTotal = subtotal + gst;
      totalsEl.innerHTML = `
        <div class="tot-row">
          <span class="tot-lbl">Subtotal</span>
          <span class="tot-val">₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="tot-row">
          <span class="tot-lbl">GST (5%) <span class="info-i">i</span></span>
          <span class="tot-val">₹${gst.toFixed(2)}</span>
        </div>
        <hr class="grand-sep">
        <div class="tot-row" style="margin-bottom:10px">
          <span class="tot-lbl bold">Total</span>
          <span class="tot-val bold">₹${grandTotal.toFixed(2)}</span>
        </div>`;
    }
  } else {
    cartBar.classList.add("hide");
    headerBadge.classList.add("hidden");
  }
}

// Clear all items from cart
window._clearCart = function () {
  cart = {};
  updateCartUI();
  renderFeatured();
  renderMenu(activeCategory);
};

// ── Checkout Summary ──────────────────────────────────────────
function renderCheckoutSummary() {
  const listEl = document.getElementById("checkout-items-list");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const gstEl = document.getElementById("checkout-gst");
  const totalEl = document.getElementById("checkout-total");

  const rows = Object.entries(cart).map(([key, entry]) => {
    const item = MENU.find(i => i.id === entry.id);
    const tags = [];
    if (entry.milk) tags.push(entry.milk);
    if (entry.size) tags.push(entry.size);
    const tagsLine = tags.length ? `<div style="font-size:11px;color:var(--text-light);margin-top:2px;">${tags.join(" · ")}</div>` : "";
    return `
      <div class="summary-row" style="flex-direction:column;align-items:flex-start;gap:0">
        <div style="display:flex;justify-content:space-between;width:100%;">
          <span class="summary-item-name">${entry.qty}x ${item.name}</span>
          <span class="summary-item-price">₹${getItemPrice(item, entry) * entry.qty}</span>
        </div>
        ${tagsLine}
      </div>`;
  }).join("");

  const subtotal = cartTotal();
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + gst;

  listEl.innerHTML = rows;
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (gstEl) gstEl.textContent = `₹${gst.toFixed(2)}`;
  totalEl.textContent = `₹${grandTotal.toFixed(2)}`;
}

// ── Place Order (Firebase) ────────────────────────────────────
window.placeOrder = async function () {
  const nameEl = document.getElementById("customer-name");
  const tableEl = document.getElementById("table-no-input");
  const noteEl = document.getElementById("chef-note");
  const btn = document.getElementById("place-order-btn");

  const customerName = nameEl.value.trim();
  const table = tableEl.value.trim();
  const note = noteEl.value.trim();

  if (!customerName) { showToast("Please enter your name"); nameEl.focus(); return; }
  if (!table) { showToast("Please enter your table number"); tableEl.focus(); return; }
  if (cartTotal() === 0) { showToast("Your cart is empty"); return; }

  // Build items array — includes milk & size for dashboard
  const items = Object.entries(cart).map(([key, entry]) => {
    const item = MENU.find(i => i.id === entry.id);
    const finalPrice = getItemPrice(item, entry);
    return {
      name: item.name,
      qty: entry.qty,
      price: finalPrice,
      total: finalPrice * entry.qty,
      milk: entry.milk || null,
      size: entry.size || null
    };
  });

  const subtotal = cartTotal();
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + gst;

  const orderData = {
    customerName,
    tableNo: table,
    note,
    items,
    subtotal,
    gst,
    total: grandTotal,
    status: "pending",
    createdAt: serverTimestamp()
  };

  btn.disabled = true;
  btn.querySelector("span").textContent = "Placing Order...";

  try {
    await addDoc(collection(db, "orders"), orderData);
    lastOrderData = { ...orderData, items, tableNo: table };
    showConfirmation(lastOrderData);
  } catch (err) {
    console.error("Firebase error:", err);
    // Fallback: show confirmation anyway for demo mode
    lastOrderData = orderData;
    showConfirmation(lastOrderData);
    showToast("Note: Connect Firebase to sync with dashboard");
  } finally {
    btn.disabled = false;
    btn.querySelector("span").textContent = "Place Order";
  }
};

function showConfirmation(orderData) {
  const summaryEl = document.getElementById("confirmed-summary");
  const itemsHTML = orderData.items.map(item => {
    const tags = [];
    if (item.milk) tags.push(item.milk);
    if (item.size) tags.push(item.size);
    const tagsLine = tags.length
      ? `<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">${tags.join(" · ")}</div>`
      : "";
    return `
    <div class="confirmed-row" style="flex-direction:column;align-items:flex-start;gap:0">
      <div style="display:flex;justify-content:space-between;width:100%;">
        <span class="confirmed-label">${item.qty}x ${item.name}</span>
        <span class="confirmed-value accent">₹${item.total}</span>
      </div>
      ${tagsLine}
    </div>`;
  }).join("");

  const sub = orderData.subtotal || orderData.total;
  const gst = orderData.gst || 0;
  const tot = orderData.total;

  summaryEl.innerHTML = `
    <div class="confirmed-row">
      <span class="confirmed-label" style="font-size:14px;font-weight:700;color:#fff;">Table ${orderData.tableNo}</span>
      <span class="confirmed-value" style="color:#F4C261;font-weight:700;">Customer: ${orderData.customerName}</span>
    </div>
    <hr class="confirmed-divider" />
    ${itemsHTML}
    <hr class="confirmed-divider" />
    <div class="confirmed-row">
      <span class="confirmed-label">Subtotal</span>
      <span class="confirmed-value">₹${sub.toFixed(2)}</span>
    </div>
    <div class="confirmed-row">
      <span class="confirmed-label">GST (5%)</span>
      <span class="confirmed-value">₹${gst.toFixed(2)}</span>
    </div>
    <hr class="confirmed-divider" />
    <div class="confirmed-row" style="margin-bottom:0">
      <span class="confirmed-total-label">Total Paid</span>
      <span class="confirmed-total-value">₹${tot.toFixed(2)}</span>
    </div>`;

  showScreen("screen-confirmed");
  cart = {};
  updateCartUI();
  renderFeatured();           // Reset featured cards back to "+" buttons
  renderMenu(activeCategory); // Reset all menu items back to "+" buttons
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ── Food Detail Modal ──────────────────────────────────────────
let fdCurrentItem = null;
let fdFavourites = new Set();

// Milk options for coffee items
const MILK_OPTIONS = ["Classic", "Coconut", "No Lactose", "Almond"];
const SIZE_OPTIONS = ["280 mL", "350 mL", "450 mL"];
// Random rating between 4.1 and 4.9
function getRating(id) {
  return (4.1 + ((id * 7) % 9) / 10).toFixed(1);
}

window.openFoodDetail = function (id) {
  const item = MENU.find(i => i.id === id);
  if (!item) return;
  fdCurrentItem = item;

  // Populate fields
  document.getElementById("fd-img").src = item.img;
  document.getElementById("fd-img").alt = item.name;
  document.getElementById("fd-name").textContent = item.name;
  document.getElementById("fd-desc").textContent = item.desc;
  document.getElementById("fd-price").textContent = "₹" + item.price;
  // Price next to dish name in white card
  const headerPriceEl = document.getElementById("fd-header-price");
  if (headerPriceEl) headerPriceEl.textContent = "₹" + item.price;
  // Category badge on hero image
  const catBadge = document.getElementById("fd-category-badge");
  if (catBadge) catBadge.textContent = item.category;
  // Category text and rating in white card name-row
  const catTextEl = document.getElementById("fd-category-text");
  if (catTextEl) catTextEl.textContent = item.category;
  const ratingValEl = document.getElementById("fd-rating-val");
  if (ratingValEl) ratingValEl.textContent = getRating(id);

  // Heart button state
  const heartBtn = document.getElementById("fd-heart-btn");
  const heartInlineBtn = document.getElementById("fd-heart-inline-btn");

  const updateHearts = () => {
    const isFav = fdFavourites.has(id);
    if (heartBtn) {
      heartBtn.style.color = isFav ? "#E05A5A" : "#fff";
      heartBtn.querySelector("svg").style.fill = isFav ? "#E05A5A" : "none";
    }
    if (heartInlineBtn) {
      heartInlineBtn.style.color = isFav ? "#E05A5A" : "#2D1A12";
      heartInlineBtn.querySelector("svg").style.fill = isFav ? "#E05A5A" : "none";
    }
  };

  updateHearts();

  const toggleFav = () => {
    if (fdFavourites.has(id)) {
      fdFavourites.delete(id);
    } else {
      fdFavourites.add(id);
    }
    updateHearts();
  };

  if (heartBtn) heartBtn.onclick = toggleFav;
  if (heartInlineBtn) heartInlineBtn.onclick = toggleFav;

  // Show milk options only for Coffee categories
  const optSection = document.getElementById("fd-options-section");
  const optRow = document.getElementById("fd-options-row");
  if (item.category === "Iced Coffee" || item.category === "Coffee Frappe") {
    optSection.style.display = "block";
    let selMilk = MILK_OPTIONS[0];
    optRow.innerHTML = MILK_OPTIONS.map(opt => `
      <button class="fd-option-chip ${opt === selMilk ? 'selected' : ''}"
        onclick="fdSelectMilk(this,'${opt}')">${opt}</button>`).join("");
  } else {
    optSection.style.display = "none";
  }

  // Show size options only for Iced Coffee, Frappe & Coffee Frappe
  const sizeSection = document.getElementById("fd-size-section");
  const sizeRow = document.getElementById("fd-sizes-row");
  if (item.category === "Iced Coffee" || item.category === "Frappe" || item.category === "Coffee Frappe") {
    sizeSection.style.display = "block";
    let selSize = SIZE_OPTIONS[1];
    sizeRow.innerHTML = SIZE_OPTIONS.map(s => {
      const label = s === "280 mL" ? "Small" : s === "350 mL" ? "Medium" : "Large";
      return `<button class="fd-size-btn ${s === selSize ? 'selected' : ''}" data-size="${s}"
        onclick="fdSelectSize(this,'${s}')">${label}<span class="sz-ml">${s}</span></button>`;
    }).join("");
  } else {
    sizeSection.style.display = "none";
  }

  // Update price display based on defaults
  updateDetailPriceDisplay();

  // Open sheet
  document.getElementById("food-detail-overlay").classList.add("open");
  document.getElementById("food-detail-sheet").classList.add("open");
  document.body.style.overflow = "hidden";
};

window.closeFoodDetail = function () {
  document.getElementById("food-detail-overlay").classList.remove("open");
  document.getElementById("food-detail-sheet").classList.remove("open");
  document.body.style.overflow = "";
};

function getCalculatedDetailPrice() {
  if (!fdCurrentItem) return 0;
  let price = fdCurrentItem.price;

  const selMilkEl = document.querySelector(".fd-option-chip.selected");
  const selSizeEl = document.querySelector(".fd-size-btn.selected");
  const milk = selMilkEl ? selMilkEl.textContent.trim() : null;
  // Use data-size attribute so we get "280 mL" even though button now shows "Small"
  const size = selSizeEl ? (selSizeEl.dataset.size || selSizeEl.textContent.trim()) : null;

  // Size adjustments: ±20 for Iced Coffee, ±30 for Frappe/Coffee Frappe
  const sizeStep = fdCurrentItem.category === "Iced Coffee" ? 20 : 30;
  if (size === "280 mL") price -= sizeStep;
  if (size === "450 mL") price += sizeStep;

  // Milk upcharges (same across all categories)
  if (milk === "No Lactose") price += 20;
  if (milk === "Coconut") price += 30;
  if (milk === "Almond") price += 40;

  return price;
}

function updateDetailPriceDisplay() {
  const price = getCalculatedDetailPrice();
  // Update bottom bar price
  const priceEl = document.getElementById("fd-price");
  if (priceEl) priceEl.textContent = "₹" + price;
  // Update name-row price (syncs with size/milk changes)
  const headerPriceEl = document.getElementById("fd-header-price");
  if (headerPriceEl) headerPriceEl.textContent = "₹" + price;

  const btn = document.getElementById("fd-order-btn");
  if (btn) btn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Add to Order`;
}

window.fdSelectMilk = function (btn, opt) {
  document.querySelectorAll(".fd-option-chip").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  updateDetailPriceDisplay();
};

window.fdSelectSize = function (btn, size) {
  document.querySelectorAll(".fd-size-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  updateDetailPriceDisplay();
};

window.fdAddToCart = function () {
  if (!fdCurrentItem) return;
  // Read selected milk option
  const selMilkEl = document.querySelector(".fd-option-chip.selected");
  const selSizeEl = document.querySelector(".fd-size-btn.selected");
  const milk = selMilkEl ? selMilkEl.textContent.trim() : null;
  // Use data-size so we pass "280 mL"/"350 mL"/"450 mL" to the cart
  const size = selSizeEl ? (selSizeEl.dataset.size || selSizeEl.textContent.trim()) : null;
  addToCart(fdCurrentItem.id, milk, size);
  closeFoodDetail();
};