// ============================================================
//  BREW & BITES — Owner Dashboard Logic (dashboard.js)
//  Firebase Firestore: real-time listener on "orders" collection
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

// ── Constants ──────────────────────────────────────────────────
// No password stored here! Firebase Auth handles it securely.

// ── State ──────────────────────────────────────────────────
let allOrders = [];
let bellOn = true;
let prevPendingCount = 0;
let unsubscribeOrders = null;
let firebaseApp, db, auth;
let activeTab = "live";
let audioCtx = null;

// ── Firebase Init ───────────────────────────────────────────────
function initFirebase() {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    return true;
  } catch (e) {
    console.error("Firebase init error:", e);
    return false;
  }
}

// ── Auth State Listener ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initFirebase();

  // Firebase resolves auth state on load — hide loading screen after
  onAuthStateChanged(auth, (user) => {
    hideAuthLoading(); // always hide spinner first
    if (user) {
      showDashboard();
    } else {
      // No authenticated user — show login screen only
      document.getElementById("login-screen").style.display = "flex";
      document.getElementById("dashboard-screen").style.display = "none";
    }
  });

  // Set month label
  const now = new Date();
  document.getElementById("month-label").textContent =
    now.toLocaleString("default", { month: "long", year: "numeric" });
});

// ── Hide auth loading screen ────────────────────────────────────────
function hideAuthLoading() {
  const el = document.getElementById("auth-loading");
  if (el) el.style.display = "none";
}

// ── Login ─────────────────────────────────────────────────────
window.doLogin = async function () {
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-password");
  const errEl = document.getElementById("login-error");
  const btn = document.getElementById("login-btn");

  const email = emailInput.value.trim();
  const password = passInput.value;

  if (!email || !password) {
    errEl.textContent = "❌ Please enter your email and password.";
    errEl.classList.remove("hidden");
    return;
  }

  btn.textContent = "Signing in...";
  btn.disabled = true;
  errEl.classList.add("hidden");
  initAudio(); // init sound on user click

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will fire and call showDashboard()
  } catch (e) {
    btn.textContent = "Access Dashboard";
    btn.disabled = false;
    errEl.textContent = "❌ Wrong email or password. Try again.";
    errEl.classList.remove("hidden");
    passInput.value = "";
    passInput.focus();
  }
};

// ── Logout ────────────────────────────────────────────────────
window.doLogout = async function () {
  if (unsubscribeOrders) { unsubscribeOrders(); unsubscribeOrders = null; }
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Firebase Auth signOut failed:", e);
  }
  // onAuthStateChanged will fire with null user and show login screen
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("dashboard-screen").style.display = "none";
  document.getElementById("login-btn").textContent = "Access Dashboard";
  document.getElementById("login-btn").disabled = false;
  document.getElementById("login-password").value = "";
  document.getElementById("login-email").value = "";
};

function showDashboard() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("dashboard-screen").style.display = "block";
  initAudio();
  startRealtimeListener();
  cleanupOldOrders();

  // Set month label
  const now = new Date();
  document.getElementById("month-label").textContent =
    now.toLocaleString("default", { month: "long", year: "numeric" });
}

// ── Monthly Auto-Cleanup (delete orders > 30 days old) ────────────
async function cleanupOldOrders() {
  if (!db) return;
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // 30 days ago

    const q = query(
      collection(db, "orders"),
      where("createdAt", "<", cutoff)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    // Delete all orders older than 30 days
    const deletes = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletes);
    console.log(`✅ Auto-cleanup: removed ${snapshot.docs.length} orders older than 30 days`);
  } catch (e) {
    console.log("Cleanup skipped:", e.message);
  }
}

// ── Audio Init (must be called inside a user click) ───────────
function initAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if browser suspended it
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  } catch (e) {
    console.log("Audio init failed:", e);
  }
}

// ── Real-time Listener ────────────────────────────────────────
function startRealtimeListener() {
  if (!db) {
    // Demo mode — show sample data if Firebase not configured
    renderDemoMode();
    return;
  }

  // NOTE: No orderBy() here — avoids requiring a composite Firestore index.
  // We sort the results client-side instead.
  const q = query(collection(db, "orders"));

  unsubscribeOrders = onSnapshot(q, (snapshot) => {
    allOrders = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date()
    }));

    // Sort newest first, client-side
    allOrders.sort((a, b) => b.createdAt - a.createdAt);

    updateStats();
    renderCurrentTab();
    checkNewOrders();
  }, (err) => {
    console.error("Firestore listener error:", err);
    // Show the actual error message so you can debug it
    showToast(`⚠️ Firestore error: ${err.code || err.message}`, 6000);
    // Only fall back to demo mode if user is not authenticated
    if (!auth.currentUser) {
      renderDemoMode();
    }
  });
}

// ── Stats Calculator ───────────────────────────────────────────
function updateStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let monthlyRevenue = 0;
  let todayRevenue = 0;
  let pendingValue = 0;
  let ordersToday = 0;

  allOrders.forEach(order => {
    const t = order.createdAt instanceof Date ? order.createdAt : new Date();
    const isToday = t >= todayStart;
    const isMonth = t >= monthStart;

    if (order.status === "completed") {
      if (isMonth) monthlyRevenue += order.total || 0;
      if (isToday) todayRevenue += order.total || 0;
    }
    if (order.status === "pending") {
      pendingValue += order.total || 0;
    }
    if (isToday) ordersToday++;
  });

  animateValue("stat-monthly", monthlyRevenue, true);
  animateValue("stat-today", todayRevenue, true);
  animateValue("stat-pending-val", pendingValue, true);
  animateValue("stat-orders-today", ordersToday, false);

  // Update pending pill
  const pendingOrders = allOrders.filter(o => o.status === "pending");
  const pendingPill = document.getElementById("pending-pill");
  pendingPill.textContent = `${pendingOrders.length} Pending`;
  if (pendingOrders.length > 0) {
    pendingPill.classList.add("has-orders");
  } else {
    pendingPill.classList.remove("has-orders");
  }
}

function animateValue(elId, target, currency) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = currency ? `₹${target.toLocaleString("en-IN")}` : target.toLocaleString("en-IN");
}

// ── New Order Notification ────────────────────────────────────
function checkNewOrders() {
  const current = allOrders.filter(o => o.status === "pending").length;
  if (current > prevPendingCount && bellOn && prevPendingCount !== -1) {
    playPing();
    showToast(`New order received!`, 3000, true);
  }
  prevPendingCount = current;
}

// ── Bell Sound via Web Audio API ───────────────────────────────
function playPing() {
  if (!bellOn || !audioCtx) return;
  try {
    // Resume context if browser paused it
    if (audioCtx.state === "suspended") audioCtx.resume();

    // 3-note ascending chime: ding ding ding ✨
    const notes = [
      { freq: 880, start: 0, dur: 0.6 },
      { freq: 1100, start: 0.2, dur: 0.6 },
      { freq: 1320, start: 0.4, dur: 0.8 }
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = audioCtx.currentTime + start;
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    });
  } catch (e) {
    console.log("Bell sound error:", e);
  }
}

// ── Tab Switching ──────────────────────────────────────────────
window.switchTab = function (tab) {
  activeTab = tab;
  document.getElementById("tab-live").classList.toggle("active", tab === "live");
  document.getElementById("tab-past").classList.toggle("active", tab === "past");
  document.getElementById("panel-live").classList.toggle("hidden", tab !== "live");
  document.getElementById("panel-past").classList.toggle("hidden", tab !== "past");
  renderCurrentTab();
};

function renderCurrentTab() {
  if (activeTab === "live") renderLiveOrders();
  else renderPastOrders();
}

// ── Live Orders ────────────────────────────────────────────────
function renderLiveOrders() {
  const grid = document.getElementById("live-orders-grid");
  const pending = allOrders.filter(o => o.status === "pending");

  if (pending.length === 0) {
    grid.innerHTML = `
      <div class="empty-orders">
        <div class="empty-orders-icon">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--brown-light)">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="2" x2="6" y2="4"/>
            <line x1="10" y1="2" x2="10" y2="4"/>
            <line x1="14" y1="2" x2="14" y2="4"/>
          </svg>
        </div>
        <div class="empty-orders-text">All caught up!</div>
        <div class="empty-orders-sub">No pending orders right now</div>
      </div>`;
    return;
  }

  grid.innerHTML = pending.map(order => buildOrderCard(order)).join("");
}

function buildOrderCard(order) {
  const timeStr = formatTime(order.createdAt);
  const itemsHTML = (order.items || []).map(item => {
    const tagParts = [];
    if (item.milk) tagParts.push(`<span class="dash-tag dash-tag-milk"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M8 2h8l2 6H6L8 2z"/><path d="M6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><line x1="12" y1="12" x2="12" y2="18"/></svg>${item.milk}</span>`);
    if (item.size) tagParts.push(`<span class="dash-tag dash-tag-size"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${item.size}</span>`);
    const tagsLine = tagParts.length
      ? `<div class="dash-item-tags">${tagParts.join("")}</div>`
      : "";
    return `<div class="order-item-row">
       <div class="order-item-left">
         <span class="order-item-name-text">${item.qty}x ${item.name}</span>
         ${tagsLine}
       </div>
       <span class="order-item-price">₹${item.total || item.price * item.qty}</span>
     </div>`;
  }).join("");

  const noteHTML = order.note
    ? `<div class="order-note"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px;flex-shrink:0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>${order.note}</div>`
    : "";

  return `
    <div class="order-card status-pending" id="card-${order.id}">
      <div class="order-card-header">
        <div class="order-table-no">Table ${order.tableNo}</div>
        <div class="order-time">${timeStr}</div>
      </div>
      <div class="order-customer-name">${order.customerName || "Guest"}</div>
      <div class="order-items-list">${itemsHTML}</div>
      ${noteHTML}
      <div class="order-footer">
        <div class="order-total">₹${order.total}</div>
        <span class="order-status-badge status-badge-pending">Pending</span>
      </div>
      <div class="order-actions">
        <button class="action-btn btn-complete"
          onclick="markOrder('${order.id}','completed')"
          id="btn-complete-${order.id}">
          Mark Complete
        </button>
        <button class="action-btn btn-cancel"
          onclick="markOrder('${order.id}','cancelled')"
          id="btn-cancel-${order.id}">
          Cancel Order
        </button>
      </div>
    </div>`;
}

// ── Past Orders ────────────────────────────────────────────────
function renderPastOrders() {
  const tbody = document.getElementById("past-orders-body");
  const past = allOrders.filter(o => o.status !== "pending");

  if (past.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-light)">
        No completed or cancelled orders yet
      </td></tr>`;
    return;
  }

  tbody.innerHTML = past.map(order => {
    const statusClass = order.status === "completed"
      ? "status-badge-completed" : "status-badge-cancelled";
    const statusLabel = order.status === "completed" ? "✓ Completed" : "✗ Cancelled";
    const itemsSummary = (order.items || []).map(i => {
      const tags = [i.milk, i.size].filter(Boolean);
      return `${i.qty}x ${i.name}${tags.length ? ` <span style="color:var(--accent);font-weight:600;font-size:12px">(${tags.join(" · ")})</span>` : ""}`;
    }).join("<br>");
    return `
      <tr>
        <td><strong>Table ${order.tableNo}</strong></td>
        <td>${order.customerName || "Guest"}</td>
        <td style="max-width:260px;line-height:1.6;">${itemsSummary}</td>
        <td><strong style="color:var(--accent)">₹${order.total}</strong></td>
        <td><span class="order-status-badge ${statusClass}">${statusLabel}</span></td>
        <td style="color:var(--text-light)">${formatTime(order.createdAt)}</td>
      </tr>`;
  }).join("");
}

// ── Mark Order Status ─────────────────────────────────────────
window.markOrder = async function (orderId, newStatus) {
  const completeBtn = document.getElementById(`btn-complete-${orderId}`);
  const cancelBtn = document.getElementById(`btn-cancel-${orderId}`);

  if (completeBtn) completeBtn.disabled = true;
  if (cancelBtn) cancelBtn.disabled = true;

  try {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });

    const label = newStatus === "completed" ? "Order completed ✓" : "Order cancelled";
    showToast(label);

    // Animate card out
    const card = document.getElementById(`card-${orderId}`);
    if (card) {
      card.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      card.style.transition = "all 0.3s ease";
    }
  } catch (err) {
    console.error("Update error:", err);
    showToast("Error updating order — check Firebase connection");
    if (completeBtn) completeBtn.disabled = false;
    if (cancelBtn) cancelBtn.disabled = false;
  }
};

// ── Bell Toggle ───────────────────────────────────────────────
window.toggleBell = function () {
  bellOn = !bellOn;
  const btn = document.getElementById("bell-btn");
  const bellSVG = bellOn
    ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;display:inline-block;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
    : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;display:inline-block;"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  btn.innerHTML = bellSVG + (bellOn ? "Bell On" : "Bell Off");
  btn.classList.toggle("on", bellOn);
};

// ── Demo Mode (when Firebase not configured) ──────────────────
function renderDemoMode() {
  const demoOrders = [
    {
      id: "demo1",
      tableNo: "3",
      customerName: "Rahul",
      items: [
        { name: "Cappuccino", qty: 2, price: 180, total: 360, milk: "Coconut", size: "350 mL" },
        { name: "Brownie", qty: 1, price: 160, total: 160, milk: null, size: null }
      ],
      total: 520,
      note: "Extra hot please",
      status: "pending",
      createdAt: new Date()
    },
    {
      id: "demo2",
      tableNo: "7",
      customerName: "Priya",
      items: [
        { name: "Cold Coffee", qty: 1, price: 160, total: 160, milk: null, size: "450 mL" },
        { name: "Veg Sandwich", qty: 1, price: 140, total: 140, milk: null, size: null }
      ],
      total: 300,
      note: "",
      status: "pending",
      createdAt: new Date(Date.now() - 8 * 60000)
    },
    {
      id: "demo3",
      tableNo: "1",
      customerName: "Amit",
      items: [{ name: "Espresso", qty: 1, price: 120, total: 120 }],
      total: 120,
      note: "",
      status: "completed",
      createdAt: new Date(Date.now() - 30 * 60000)
    }
  ];

  allOrders = demoOrders;
  prevPendingCount = -1; // suppress notification on load

  // Fake some revenue
  document.getElementById("stat-monthly").textContent = "₹9,960";
  document.getElementById("stat-today").textContent = "₹3,980";
  document.getElementById("stat-pending-val").textContent = "₹820";
  document.getElementById("stat-orders-today").textContent = "14";
  document.getElementById("pending-pill").textContent = "2 Pending";
  document.getElementById("pending-pill").classList.add("has-orders");

  renderLiveOrders();
  showToast("⚠️ Demo mode — add Firebase keys to go live", 5000);

  // Override markOrder for demo
  window.markOrder = function (orderId, newStatus) {
    const idx = allOrders.findIndex(o => o.id === orderId);
    if (idx !== -1) allOrders[idx].status = newStatus;
    renderLiveOrders();
    updateStats();
    showToast(newStatus === "completed" ? "Order completed ✓" : "Order cancelled");
  };
}

// ── Helpers ────────────────────────────────────────────────────
function formatTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    ", " + d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

let toastTimer;
function showToast(msg, duration = 3000, withBell = false) {
  const toast = document.getElementById("toast");
  if (withBell) {
    const bellIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    toast.innerHTML = bellIcon + msg;
  } else {
    toast.textContent = msg;
  }
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}
