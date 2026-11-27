/* =========================================================
   nav.js - SHARED behaviour for every page
   1. Highlight the current page in the navbar
   2. Mobile menu button
   3. Sign in / Create account pop-up (RegExp validation)
   4. Remember the signed-in user between pages (localStorage)
   ========================================================= */
"use strict";

(function () {
  // ---------- helpers ----------
  function saveUser(user) {
    try {
      if (user) localStorage.setItem("nestkeyUser", JSON.stringify(user));
      else localStorage.removeItem("nestkeyUser");
    } catch (e) { /* storage blocked: ignore */ }
  }
  function loadUser() {
    try {
      const raw = localStorage.getItem("nestkeyUser");
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function showToast(text) {
    let toast = document.getElementById("nkToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "nkToast";
      toast.className = "nk-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.display = "block";
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.style.display = "none"; }, 2200);
  }
  window.nkToast = showToast; // other pages can reuse it

  // ---------- 1. active link ----------
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const pageMap = {
    "index.html": "home",
    "listing.html": "properties",
    "property-details.html": "properties",
    "dashboard.html": "dashboard",
    "rent-maintenance.html": "rent",
    "about.html": "about"
  };
  const current = pageMap[file];
  document.querySelectorAll(".nk-links a[data-page]").forEach(function (link) {
    link.classList.toggle("active", link.dataset.page === current);
  });

  // ---------- 2. mobile menu ----------
  const toggle = document.querySelector(".nk-toggle");
  const links = document.getElementById("nkLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  // ---------- 3. sign in / register pop-up ----------
  const signBtn = document.querySelector(".nk-signin");
  if (!signBtn) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  let mode = "login"; // "login" or "register"
  let user = loadUser();

  const overlay = document.createElement("div");
  overlay.className = "nk-modal";
  overlay.innerHTML =
    '<div class="nk-box" role="dialog" aria-modal="true">' +
    '<button type="button" class="nk-close" aria-label="Close">&times;</button>' +
    '<h2 id="nkTitle">Sign in</h2>' +
    '<p class="nk-sub" id="nkSub">Welcome back to NestKey.</p>' +
    '<input type="text" id="nkName" placeholder="Full name" style="display:none">' +
    '<input type="text" id="nkEmail" placeholder="Email">' +
    '<input type="password" id="nkPass" placeholder="Password (min 6 characters)">' +
    '<label class="nk-show"><input type="checkbox" id="nkShow"> Show password</label>' +
    '<div class="nk-error" id="nkError"></div>' +
    '<button type="button" class="nk-primary" id="nkSubmit">Sign in</button>' +
    '<p class="nk-switch" id="nkSwitch"></p>' +
    "</div>";
  document.body.appendChild(overlay);

  const $ = function (id) { return document.getElementById(id); };

  function setMode(newMode) {
    mode = newMode;
    const isLogin = mode === "login";
    $("nkTitle").textContent = isLogin ? "Sign in" : "Create account";
    $("nkSub").textContent = isLogin ? "Welcome back to NestKey." : "Join NestKey in a few seconds.";
    $("nkName").style.display = isLogin ? "none" : "block";
    $("nkSubmit").textContent = isLogin ? "Sign in" : "Create account";
    $("nkSwitch").innerHTML = isLogin
      ? 'New here? <a data-switch="register">Create an account</a>'
      : 'Already have an account? <a data-switch="login">Sign in</a>';
    $("nkError").textContent = "";
  }

  function openModal(newMode) {
    setMode(newMode || "login");
    overlay.style.display = "flex";
    $(mode === "login" ? "nkEmail" : "nkName").focus();
  }
  function closeModal() { overlay.style.display = "none"; }

  function refreshButton() {
    signBtn.textContent = user ? "Sign out (" + user.name + ")" : "Sign in";
  }

  function submit() {
    const name = $("nkName").value.trim();
    const email = $("nkEmail").value.trim();
    const pass = $("nkPass").value;
    const err = $("nkError");

    if (mode === "register" && name.length < 2) { err.textContent = "Please enter your name."; return; }
    if (!emailPattern.test(email)) { err.textContent = "Please enter a valid email address."; return; }
    if (pass.length < 6) { err.textContent = "Password must be at least 6 characters."; return; }

    // Demo only: there is no server, so we just remember the user in this browser.
    const shownName = mode === "register" ? name.split(" ")[0] : email.split("@")[0];
    user = { name: shownName, email: email };
    saveUser(user);
    refreshButton();
    closeModal();
    $("nkPass").value = "";
    showToast(mode === "register" ? "Account created. Welcome, " + shownName + "!" : "Signed in as " + email);
  }

  // events
  signBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (user) {
      user = null; saveUser(null); refreshButton(); showToast("Signed out");
    } else {
      openModal("login");
    }
  });
  overlay.querySelector(".nk-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
    const sw = e.target.closest("[data-switch]");
    if (sw) setMode(sw.dataset.switch);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Enter" && overlay.style.display === "flex") submit();
  });
  $("nkShow").addEventListener("change", function (e) {
    $("nkPass").type = e.target.checked ? "text" : "password";
  });
  $("nkSubmit").addEventListener("click", submit);

  // any button/link on the page with data-auth="login" or "register" opens the pop-up
  document.addEventListener("click", function (e) {
    const trigger = e.target.closest("[data-auth]");
    if (!trigger) return;
    e.preventDefault();
    if (user && trigger.dataset.auth === "register") { showToast("You are already signed in."); return; }
    openModal(trigger.dataset.auth);
  });

  refreshButton();
})();
