// home-basic.js - Basic JavaScript only (no jQuery, no classes, no fetch)

// ---------- 1. Select elements from the page (DOM) ----------
var searchInput = document.getElementById("searchInput");
var searchBtn = document.getElementById("searchBtn");
var grid = document.getElementById("propertyGrid");
var cards = document.querySelectorAll(".property-card");
var popularCities = document.querySelectorAll("#popularCities a");

var currentStatus = "all"; // which filter is selected
var sortAscending = true;  // sort direction

// ---------- 2. Get status of a card (if / else) ----------
function getStatus(card) {
  var tag = card.querySelector(".tag");
  if (tag.classList.contains("tag-occupied")) {
    return "occupied";
  } else if (tag.classList.contains("tag-maintenance")) {
    return "maintenance";
  } else {
    return "available";
  }
}

// Get price as a number from text like "₹12,000 / month"
function getPrice(card) {
  var text = card.querySelector(".price").textContent;
  var digits = text.replace(/[^0-9]/g, ""); // keep only digits
  return Number(digits);
}

// ---------- 3. Search + filter (loop, string methods, operators) ----------
function applyFilters() {
  var query = searchInput.value.toLowerCase().trim();
  var shown = 0;

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var text = card.textContent.toLowerCase();

    var matchesSearch = text.includes(query);
    var matchesStatus = currentStatus === "all" || getStatus(card) === currentStatus;

    if (matchesSearch && matchesStatus) {
      card.style.display = "block";
      shown++;
    } else {
      card.style.display = "none";
    }
  }

  document.getElementById("countText").textContent =
    shown + " of " + cards.length + " properties shown";
}

// ---------- 4. Create the filter buttons (DOM manipulation) ----------
function createFilterBar() {
  var bar = document.createElement("div");
  bar.style.marginBottom = "20px";

  var names = ["all", "available", "occupied", "maintenance"];
  var labels = ["All", "Available", "Occupied", "Under repair"];

  for (var i = 0; i < names.length; i++) {
    var btn = document.createElement("button");
    btn.textContent = labels[i];
    btn.className = "btn btn-outline btn-small";
    btn.style.marginRight = "8px";
    btn.setAttribute("data-status", names[i]);

    btn.onclick = function () {
      currentStatus = this.getAttribute("data-status");
      applyFilters();
    };
    bar.appendChild(btn);
  }

  // Sort button
  var sortBtn = document.createElement("button");
  sortBtn.textContent = "Sort by price";
  sortBtn.className = "btn btn-outline btn-small";
  sortBtn.onclick = sortCards;
  bar.appendChild(sortBtn);

  // Text showing how many cards are visible
  var count = document.createElement("span");
  count.id = "countText";
  count.style.marginLeft = "15px";
  bar.appendChild(count);

  grid.parentNode.insertBefore(bar, grid);
}

// ---------- 5. Sort cards by price (arrays) ----------
function sortCards() {
  var list = Array.from(cards); // convert to a real array

  list.sort(function (a, b) {
    if (sortAscending) {
      return getPrice(a) - getPrice(b);
    } else {
      return getPrice(b) - getPrice(a);
    }
  });

  for (var i = 0; i < list.length; i++) {
    grid.appendChild(list[i]); // moves card to the new position
  }
  sortAscending = !sortAscending; // flip direction
}

// ---------- 6. Heart (save) button on every card ----------
function addHearts() {
  for (var i = 0; i < cards.length; i++) {
    var imageBox = cards[i].querySelector(".card-image");
    imageBox.style.position = "relative";

    var heart = document.createElement("button");
    heart.textContent = "♡";
    heart.style.cssText =
      "position:absolute;top:10px;right:10px;width:34px;height:34px;" +
      "border:none;border-radius:50%;cursor:pointer;background:white;";

    heart.onclick = function () {
      if (this.textContent === "♡") {
        this.textContent = "♥";
        this.style.color = "red";
      } else {
        this.textContent = "♡";
        this.style.color = "black";
      }
    };
    imageBox.appendChild(heart);
  }
}

// ---------- 7. Animated counters (setInterval) ----------
function runCounters() {
  var numbers = document.querySelectorAll("[data-target]");

  for (var i = 0; i < numbers.length; i++) {
    countUp(numbers[i]);
  }
}

function countUp(element) {
  var target = Number(element.getAttribute("data-target"));
  var suffix = element.getAttribute("data-suffix");
  var current = 0;
  var step = target / 50;

  var timer = setInterval(function () {
    current = current + step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.round(current) + suffix;
  }, 30);
}

// ---------- 9. Events: connect everything ----------
createFilterBar();
addHearts();
runCounters();
applyFilters();

searchInput.addEventListener("input", applyFilters); // live search

searchBtn.addEventListener("click", function (event) {
  event.preventDefault();
  applyFilters();
});

for (var i = 0; i < popularCities.length; i++) {
  popularCities[i].addEventListener("click", function (event) {
    event.preventDefault();
    searchInput.value = this.getAttribute("data-city");
    applyFilters();
  });
}

window.addEventListener("scroll", function () {
  var header = document.querySelector(".site-header");
  if (window.scrollY > 20) {
    header.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
  } else {
    header.style.boxShadow = "none";
  }
});
