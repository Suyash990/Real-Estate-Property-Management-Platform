/* =========================================================
   home.js  -  HOME PAGE INTERACTIVITY (NestKey)
   Uses only mid-term topics:
   JS basics, operators, strings, arrays, loops, RegExp,
   classes/OOP, DOM + events, Promises/async-await,
   Fetch API + JSON, jQuery selectors/effects/events/AJAX.
   ========================================================= */

"use strict";

/* ---------- 1. CLASS (OOP with JS) ---------- */
class Property {
  constructor(title, location, price, status, beds) {
    this.title = title;
    this.location = location;
    this.price = price;
    this.status = status; // "available" | "occupied" | "maintenance"
    this.beds = beds;
  }

  // Search by a string (case-insensitive) in title or location
  matches(query) {
    const q = query.trim().toLowerCase();
    return (
      this.title.toLowerCase().includes(q) ||
      this.location.toLowerCase().includes(q)
    );
  }
}

/* ---------- 2. STATE ---------- */
let allCards = [];          // array of <article> elements
let activeStatus = "all";   // current status filter
let sortAsc = true;         // price sort direction

/* ---------- 3. HELPERS ---------- */
// Read a card's data from the DOM and build a Property object
function cardToProperty(card) {
  const title = card.querySelector("h3").textContent;
  const location = card.querySelector(".location").textContent;
  const priceText = card.querySelector(".price").textContent;
  const price = Number(priceText.replace(/[^0-9]/g, "")); // RegExp: keep digits only
  const tag = card.querySelector(".tag");
  let status = "available";
  if (tag.classList.contains("tag-occupied")) status = "occupied";
  if (tag.classList.contains("tag-maintenance")) status = "maintenance";
  const beds = parseInt(card.querySelector(".features li").textContent) || 0;
  return new Property(title, location, price, status, beds);
}

/* ---------- 4. FILTER + SEARCH (DOM + events) ---------- */
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value;
  let visibleCount = 0;

  for (const card of allCards) {
    const p = card._property;
    const okSearch = query === "" || p.matches(query);
    const okStatus = activeStatus === "all" || p.status === activeStatus;

    if (okSearch && okStatus) {
      $(card).stop(true, true).fadeIn(250); // jQuery effect
      visibleCount++;
    } else {
      $(card).stop(true, true).fadeOut(200);
    }
  }

  // "No results" message
  const msg = document.getElementById("noResults");
  msg.style.display = visibleCount === 0 ? "block" : "none";
  document.getElementById("resultCount").textContent =
    visibleCount + " of " + allCards.length + " properties shown";
}

/* Build the filter bar with DOM manipulation */
function buildFilterBar() {
  const grid = document.getElementById("propertyGrid");

  const bar = document.createElement("div");
  bar.className = "filter-bar";
  bar.style.cssText =
    "display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:24px;";

  const filters = [
    ["all", "All"],
    ["available", "Available"],
    ["occupied", "Occupied"],
    ["maintenance", "Under repair"],
  ];

  filters.forEach(([value, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.dataset.status = value;
    btn.className = "btn btn-outline btn-small filter-btn";
    if (value === "all") btn.classList.add("is-active");
    bar.appendChild(btn);
  });

  const sortBtn = document.createElement("button");
  sortBtn.type = "button";
  sortBtn.id = "sortBtn";
  sortBtn.className = "btn btn-outline btn-small";
  sortBtn.textContent = "Sort by price ↑";
  bar.appendChild(sortBtn);

  const count = document.createElement("span");
  count.id = "resultCount";
  count.style.cssText = "margin-left:auto;font-size:14px;";
  bar.appendChild(count);

  grid.parentNode.insertBefore(bar, grid);

  // "No results" box
  const none = document.createElement("p");
  none.id = "noResults";
  none.textContent = "No properties match your search. Try another city or filter.";
  none.style.cssText = "display:none;text-align:center;padding:30px 0;";
  grid.parentNode.insertBefore(none, grid.nextSibling);

  // Highlight style for the active button (added once)
  const style = document.createElement("style");
  style.textContent =
    ".filter-btn.is-active{background:var(--accent);color:#fff;border-color:var(--accent);}" +
    ".field-error{color:#C0392B;font-size:13px;margin-top:6px;}" +
    ".toast{position:fixed;bottom:24px;right:24px;background:var(--ink);color:#fff;" +
    "padding:12px 18px;border-radius:var(--radius);display:none;z-index:99;}" +
    ".hero-note a{color:var(--accent);font-weight:600;}";
  document.head.appendChild(style);

  // Events: filter buttons (event delegation on the bar)
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeStatus = btn.dataset.status;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.toggle("is-active", b === btn));
    applyFilters();
  });

  // Sort cards by price using Array.sort
  sortBtn.addEventListener("click", () => {
    allCards.sort((a, b) =>
      sortAsc ? a._property.price - b._property.price : b._property.price - a._property.price
    );
    allCards.forEach((card) => grid.appendChild(card)); // re-order in DOM
    sortBtn.textContent = "Sort by price " + (sortAsc ? "↓" : "↑");
    sortAsc = !sortAsc;
  });
}

/* ---------- 5. SEARCH BOX + POPULAR CITIES ---------- */
function setupSearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");

  input.addEventListener("input", applyFilters); // live search

  // Search button: filter on this page instead of leaving
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    applyFilters();
    document.getElementById("propertyGrid").scrollIntoView({ behavior: "smooth" });
  });

  // Enter key
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });

  // Popular cities: click fills the search box
  document.getElementById("popularCities").addEventListener("click", (e) => {
    const link = e.target.closest("a[data-city]");
    if (!link) return;
    e.preventDefault();
    input.value = link.dataset.city;
    applyFilters();
  });
}

/* ---------- 6. ANIMATED STAT COUNTERS (loops + timers) ---------- */
function animateCounters() {
  const counters = document.querySelectorAll("[data-target]");

  counters.forEach((el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const steps = 60;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const value = Math.round((target * step) / steps);
      el.textContent = value.toLocaleString("en-IN") + suffix;
      if (step >= steps) clearInterval(timer);
    }, 25);
  });
}

// Run counters only when the stats section scrolls into view
function watchStats() {
  const stats = document.getElementById("stats");
  let done = false;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      animateCounters();
      observer.disconnect();
    }
  });
  observer.observe(stats);
}

/* ---------- 7. NAVBAR SHADOW ON SCROLL ---------- */
function setupNavbar() {
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header.style.boxShadow =
      window.scrollY > 20 ? "0 4px 14px rgba(0,0,0,0.15)" : "none";
  });
}

/* ---------- 8. jQuery: HOW-IT-WORKS STEPS (effects) ---------- */
function setupSteps() {
  // Click a step to slide its text up/down
  $(".steps li").css("cursor", "pointer").on("click", function () {
    $(this).find("p").slideToggle(250);
  });

  // Hover effect on property cards
  $("#propertyGrid").on("mouseenter", ".property-card", function () {
    $(this).css({ transform: "translateY(-6px)", transition: "transform .2s" });
  }).on("mouseleave", ".property-card", function () {
    $(this).css("transform", "translateY(0)");
  });
}

/* ---------- 9. FAVOURITE BUTTON ON CARDS ---------- */
function addFavouriteButtons() {
  allCards.forEach((card) => {
    const imgBox = card.querySelector(".card-image");
    imgBox.style.position = "relative";

    const fav = document.createElement("button");
    fav.type = "button";
    fav.textContent = "♡";
    fav.setAttribute("aria-label", "Save property");
    fav.style.cssText =
      "position:absolute;top:10px;right:10px;border:none;border-radius:50%;" +
      "width:34px;height:34px;font-size:18px;cursor:pointer;background:#fff;";
    imgBox.appendChild(fav);

    fav.addEventListener("click", () => {
      const saved = fav.textContent === "♥";
      fav.textContent = saved ? "♡" : "♥";
      fav.style.color = saved ? "inherit" : "#C0392B";
      showToast(saved ? "Removed from saved" : "Saved: " + card._property.title);
    });
  });
}

/* ---------- 9b. WHOLE CARD CLICKABLE (event delegation) ---------- */
function setupCardClick() {
  const grid = document.getElementById("propertyGrid");
  grid.style.cursor = "pointer";

  grid.addEventListener("click", (e) => {
    // Ignore clicks on the heart button (it has its own job)
    if (e.target.closest("button")) return;

    const card = e.target.closest(".property-card");
    if (!card) return;

    const link = card.querySelector("a.btn"); // the Details link
    if (!link) return;

    // Pass the title in the URL so the details page can use it
    const title = card.querySelector("h3").textContent;
    window.location.href = link.getAttribute("href") + "?title=" + encodeURIComponent(title);
  });
}

/* ---------- 10. TOAST MESSAGE ---------- */
function showToast(text) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  $(toast).stop(true, true).fadeIn(200).delay(1800).fadeOut(400);
}

/* ---------- 11. NEWSLETTER FORM (RegExp validation + jQuery AJAX) ---------- */
function setupNewsletter() {
  const cta = document.getElementById("cta");

  const form = document.createElement("div");
  form.style.cssText = "margin-top:22px;";
  form.innerHTML =
    '<input type="text" id="newsEmail" placeholder="Enter your email for updates" ' +
    'style="padding:12px 14px;border-radius:8px;border:none;width:280px;max-width:90%;">' +
    ' <button type="button" id="newsBtn" class="btn btn-light">Subscribe</button>' +
    '<div id="newsError" class="field-error"></div>';
  cta.appendChild(form);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  $("#newsBtn").on("click", function () {
    const email = $("#newsEmail").val().trim();
    const $err = $("#newsError");

    if (!emailPattern.test(email)) {
      $err.text("Please enter a valid email address.").hide().fadeIn(200);
      return;
    }
    $err.text("");

    // jQuery AJAX (demo endpoint that accepts a POST and returns JSON)
    $.ajax({
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "POST",
      data: JSON.stringify({ email: email }),
      contentType: "application/json",
    })
      .done(() => {
        showToast("Subscribed: " + email);
        $("#newsEmail").val("");
      })
      .fail(() => {
        $err.text("Something went wrong. Please try again.").fadeIn(200);
      });
  });
}

/* ---------- 12. FETCH API + ASYNC/AWAIT + ERROR HANDLING ---------- */
// Loads extra properties from a JSON file and adds them as cards.
async function loadMoreProperties() {
  try {
    const response = await fetch("properties.json");
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json(); // JSON parsing
    const grid = document.getElementById("propertyGrid");

    data.forEach((item) => {
      const tagClass = "tag-" + item.status;
      const tagText =
        item.status === "maintenance" ? "Under repair" :
        item.status.charAt(0).toUpperCase() + item.status.slice(1);

      const card = document.createElement("article");
      card.className = "property-card";
      card.innerHTML =
        '<div class="card-image"><img src="' + item.image + '" alt="' + item.title + '">' +
        '<span class="tag ' + tagClass + '">' + tagText + "</span></div>" +
        '<div class="card-body"><h3>' + item.title + "</h3>" +
        '<p class="location">' + item.location + "</p>" +
        '<ul class="features"><li>' + item.beds + " Beds</li><li>" +
        item.baths + " Baths</li><li>" + item.area + " sq ft</li></ul>" +
        '<div class="card-footer"><span class="price">&#8377;' +
        item.price.toLocaleString("en-IN") + " <small>/ month</small></span>" +
        '<a href="../property%20details/property-details.html" class="btn btn-outline btn-small">Details</a></div></div>';

      grid.appendChild(card);
    });
    return true;
  } catch (error) {
    console.error("Could not load properties.json:", error.message);
    return false;
  }
}

/* ---------- 12b. IMAGE FALLBACK (error event) ---------- */
// If an image file is missing, show a simple placeholder instead of a broken icon.
function makePlaceholder(label) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420">' +
    '<rect width="100%" height="100%" fill="#E4EAEE"/>' +
    '<text x="50%" y="50%" fill="#4A6076" font-family="Segoe UI, Arial" ' +
    'font-size="26" text-anchor="middle" dominant-baseline="middle">' +
    label.replace(/[<>&"]/g, "") + "</text></svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function fixImage(img) {
  if (img.dataset.fixed) return; // avoid infinite loop
  img.dataset.fixed = "true";
  img.src = makePlaceholder(img.alt || "Image coming soon");
}

function setupImageFallback() {
  // Images that already failed before this script ran
  document.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) fixImage(img);
  });
  // Images that fail later (error events don't bubble, so use capture)
  document.addEventListener(
    "error",
    (e) => {
      if (e.target.tagName === "IMG") fixImage(e.target);
    },
    true
  );
}

/* ---------- 13. PROMISE-BASED STARTUP ---------- */
async function init() {
  setupImageFallback();
  setupNavbar();
  setupSteps();
  watchStats();
  setupNewsletter();

  await loadMoreProperties(); // wait for fetch (works even if it fails)

  // Cache all cards (static + fetched) and attach a Property object to each
  allCards = Array.from(document.querySelectorAll(".property-card"));
  allCards.forEach((card) => (card._property = cardToProperty(card)));

  buildFilterBar();
  setupSearch();
  addFavouriteButtons();
  setupCardClick();
  applyFilters(); // sets the "x of y shown" text
}

// Start when the DOM is ready (jQuery ready + DOM event)
$(document).ready(init);
