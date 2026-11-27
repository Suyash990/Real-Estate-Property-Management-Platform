
/* =========================================================
   ESTATEEASE - PROPERTY LISTING PLATFORM

   Frontend: HTML, CSS, JavaScript
   Data Source: JSON Server

   API: http://localhost:3000/properties
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. CONFIGURATION
    // ==========================================

    const API_URL = "http://localhost:3000/properties";

    const PAGE_SIZE = 6;
    const MAX_COMPARE = 3;
    const MAX_RECENT = 5;

    const FAVORITES_KEY = "estateEaseSaved";
    const RECENT_KEY = "estateEaseRecentlyViewed";

    const FALLBACK_IMAGE =
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80";


    // ==========================================
    // 2. SELECT HTML ELEMENTS
    // ==========================================

    const elements = {

        // Search and filters
        filterForm: document.getElementById("filterForm"),
        searchInput: document.getElementById("searchInput"),
        typeFilter: document.getElementById("typeFilter"),
        bedroomFilter: document.getElementById("bedroomFilter"),
        budgetFilter: document.getElementById("budgetFilter"),
        furnishingFilter: document.getElementById("furnishingFilter"),
        availabilityFilter: document.getElementById("availabilityFilter"),
        amenityFilter: document.getElementById("amenityFilter"),
        sortSelect: document.getElementById("sortSelect"),

        // Listing controls
        favoritesToggle: document.getElementById("favoritesToggle"),
        resultsCount: document.getElementById("resultsCount"),
        clearFilters: document.getElementById("clearFilters"),
        activeFilters: document.getElementById("activeFilters"),
        apiStatus: document.getElementById("apiStatus"),

        // Property cards
        propertyGrid: document.getElementById("propertyGrid"),
        emptyState: document.getElementById("emptyState"),
        resetEmpty: document.getElementById("resetEmpty"),

        // Property insights
        insightCount: document.getElementById("insightCount"),
        averageRent: document.getElementById("averageRent"),
        lowestRent: document.getElementById("lowestRent"),
        popularType: document.getElementById("popularType"),

        // Comparison
        compareToolbar: document.getElementById("compareToolbar"),
        compareCount: document.getElementById("compareCount"),
        compareButton: document.getElementById("compareButton"),
        clearCompare: document.getElementById("clearCompare"),

        compareDialog: document.getElementById("compareDialog"),
        closeCompareDialog: document.getElementById("closeCompareDialog"),
        compareTableHead: document.getElementById("compareTableHead"),
        compareTableBody: document.getElementById("compareTableBody"),

        // Load more
        loadMoreWrap: document.getElementById("loadMoreWrap"),
        loadMoreButton: document.getElementById("loadMoreButton"),

        // Recently viewed
        recentSection: document.getElementById("recentSection"),
        recentGrid: document.getElementById("recentGrid"),
        clearRecent: document.getElementById("clearRecent"),

        // Property details popup
        propertyDialog: document.getElementById("propertyDialog"),
        closeDialog: document.getElementById("closeDialog"),
        modalImage: document.getElementById("modalImage"),
        modalBadge: document.getElementById("modalBadge"),
        modalType: document.getElementById("modalType"),
        modalTitle: document.getElementById("modalTitle"),
        modalLocation: document.getElementById("modalLocation"),
        modalPrice: document.getElementById("modalPrice"),
        modalFacts: document.getElementById("modalFacts"),
        modalAvailability: document.getElementById("modalAvailability"),
        modalFurnishing: document.getElementById("modalFurnishing"),
        modalDescription: document.getElementById("modalDescription"),
        modalAmenities: document.getElementById("modalAmenities"),
        modalShare: document.getElementById("modalShare"),
        modalDone: document.getElementById("modalDone"),

        // Notifications
        toast: document.getElementById("toast")

    };


    // ==========================================
    // 3. VALIDATE HTML ELEMENTS
    // ==========================================

    const missingElements = Object.entries(elements)
        .filter(function ([name, element]) {
            return !element;
        })
        .map(function ([name]) {
            return name;
        });

    if (missingElements.length > 0) {

        console.error(
            "Missing HTML elements:",
            missingElements.join(", ")
        );

        return;

    }


    // ==========================================
    // 4. APPLICATION STATE
    // ==========================================

    let properties = [];

    let filteredProperties = [];

    let visibleLimit = PAGE_SIZE;

    let currentPropertyId = null;

    let showFavoritesOnly = false;

    let toastTimer = null;


    // Set stores unique favourite property IDs.

    let savedProperties = new Set(
        readStoredArray(FAVORITES_KEY)
    );


    // Set stores unique comparison property IDs.

    let compareSelection = new Set();


    // Array stores recently viewed property IDs.

    let recentlyViewed = readStoredArray(RECENT_KEY)
        .slice(0, MAX_RECENT);


    // ==========================================
    // 5. LOCAL STORAGE HELPERS
    // ==========================================

    function readStoredArray(key) {

        try {

            const value = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(value)
                ? value.map(String)
                : [];

        } catch (error) {

            console.warn(
                `Could not read ${key}:`,
                error
            );

            return [];

        }

    }


    function writeStoredArray(key, values) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(values)
            );

            return true;

        } catch (error) {

            console.warn(
                `Could not save ${key}:`,
                error
            );

            showToast(
                "Your browser could not save this information."
            );

            return false;

        }

    }


    // ==========================================
    // 6. GENERAL HELPER FUNCTIONS
    // ==========================================

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, function (character) {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"

            };

            return entities[character];

        });

    }


    function safeImageURL(value) {

        try {

            const url = new URL(
                value || FALLBACK_IMAGE,
                window.location.href
            );

            return ["http:", "https:"].includes(url.protocol)
                ? url.href
                : FALLBACK_IMAGE;

        } catch (error) {

            return FALLBACK_IMAGE;

        }

    }


    function formatPrice(price) {

        return new Intl.NumberFormat("en-IN", {

            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0

        }).format(Number(price) || 0);

    }


    function titleCase(value) {

        return String(value || "")
            .toLowerCase()
            .replace(/\b\w/g, function (character) {
                return character.toUpperCase();
            });

    }


    function showToast(message) {

        elements.toast.textContent = message;

        elements.toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            elements.toast.classList.remove("show");

        }, 2600);

    }


    function setAPIStatus(message, status) {

        elements.apiStatus.textContent = message;

        elements.apiStatus.className = `api-status ${status}`;

    }


    // ==========================================
    // 7. FIND PROPERTY USING FIND()
    // ==========================================

    function getPropertyById(propertyId) {

        return properties.find(function (property) {

            return String(property.id) === String(propertyId);

        });

    }


    // ==========================================
    // 8. NORMALIZE JSON SERVER DATA
    // ==========================================

    function normalizeProperty(item) {

        const price = Number(item.price);

        const bedrooms = Number(item.bedrooms);

        const bathrooms = Number(item.bathrooms);

        const area = Number(item.area);


        const validTypes = [
            "house",
            "apartment",
            "villa"
        ];


        const validAvailability = [
            "Available",
            "Coming Soon",
            "Rented"
        ];


        const validFurnishing = [
            "Furnished",
            "Semi-Furnished",
            "Unfurnished"
        ];


        if (

            item.id === undefined ||
            !item.title ||
            !item.location ||
            !validTypes.includes(String(item.type).toLowerCase()) ||
            !Number.isFinite(price) ||
            price < 0

        ) {

            return null;

        }


        return {

            id: String(item.id),

            title: String(item.title),

            location: String(item.location),

            type: String(item.type).toLowerCase(),

            price: price,

            bedrooms: Number.isFinite(bedrooms) ? bedrooms : 0,

            bathrooms: Number.isFinite(bathrooms) ? bathrooms : 0,

            area: Number.isFinite(area) ? area : 0,

            badge: String(item.badge || "Property Listing"),

            featured: Boolean(item.featured),

            image: safeImageURL(item.image),

            description: String(
                item.description || "No description available."
            ),

            amenities: Array.isArray(item.amenities)
                ? item.amenities.map(String)
                : [],

            availability: validAvailability.includes(item.availability)
                ? item.availability
                : "Available",

            furnishing: validFurnishing.includes(item.furnishing)
                ? item.furnishing
                : "Unfurnished",

            dateAdded: item.dateAdded
                ? String(item.dateAdded)
                : ""

        };

    }


    // ==========================================
    // 9. LOAD DATA FROM JSON SERVER USING FETCH()
    // ==========================================

    async function loadProperties() {

        setAPIStatus(
            "Connecting to property database...",
            "loading"
        );

        elements.resultsCount.textContent =
            "Loading properties...";


        try {

            let response;
            let usingFile = false;

            try {
                response = await fetch(API_URL);
            } catch (networkError) {
                // json-server is not running: read the same data from db.json instead
                response = await fetch("db.json");
                usingFile = true;
            }


            if (!response.ok) {

                throw new Error(
                    `Server returned HTTP ${response.status}`
                );

            }


            let data = await response.json();

            // db.json keeps the list inside a "properties" key
            if (usingFile && data && Array.isArray(data.properties)) {
                data = data.properties;
            }


            if (!Array.isArray(data)) {

                throw new Error(
                    "API response must be a property array."
                );

            }


            // Convert API records into usable property objects.

            properties = data
                .map(normalizeProperty)
                .filter(Boolean);


            // Keep only IDs which still exist in the database.

            const validIDs = new Set(
                properties.map(function (property) {
                    return property.id;
                })
            );


            savedProperties = new Set(

                [...savedProperties].filter(function (id) {
                    return validIDs.has(id);
                })

            );


            recentlyViewed = recentlyViewed.filter(function (id) {
                return validIDs.has(id);
            });


            // Remove invalid saved and recent IDs.

            writeStoredArray(
                FAVORITES_KEY,
                [...savedProperties]
            );

            writeStoredArray(
                RECENT_KEY,
                recentlyViewed
            );


            // Remove invalid comparison IDs.

            compareSelection = new Set(

                [...compareSelection].filter(function (id) {
                    return validIDs.has(id);
                })

            );


            if (properties.length === 0) {

                setAPIStatus(
                    "Connected, but no valid property records were found.",
                    "error"
                );

            } else {

                setAPIStatus(
                    `Connected to JSON Server. ${properties.length} properties loaded.`,
                    "success"
                );

            }


            updateFavoritesButton();

            updateCompareToolbar();

            renderRecentlyViewed();

            filterProperties();


            // Open a shared property if its ID is present in the URL.

            const sharedPropertyId = new URLSearchParams(
                window.location.search
            ).get("property");


            if (sharedPropertyId) {

                const sharedProperty = getPropertyById(
                    sharedPropertyId
                );

                if (sharedProperty) {

                    openPropertyDetails(sharedProperty.id);

                }

            }


            console.log(
                "NestKey: Properties loaded successfully from JSON Server."
            );


        } catch (error) {

            console.error(
                "Unable to load properties:",
                error
            );


            properties = [];

            filteredProperties = [];

            elements.propertyGrid.innerHTML = "";

            elements.resultsCount.textContent =
                "Properties could not be loaded.";


            elements.emptyState.hidden = false;


            const heading = elements.emptyState.querySelector("h3");

            const message = elements.emptyState.querySelector("p");

            const resetButton = elements.emptyState.querySelector("button");


            if (heading) {

                heading.textContent = "Unable to load properties";

            }


            if (message) {

                message.textContent =
                    "Start JSON Server and make sure db.json contains a properties array. Then try again.";

            }


            if (resetButton) {

                resetButton.hidden = true;

            }


            updatePropertyInsights([]);

            updateLoadMore();


            elements.apiStatus.innerHTML = `

                Cannot connect to JSON Server.

                Check that it is running at localhost:3000.

                <button type="button" data-retry-api>
                    Retry connection
                </button>

            `;

            elements.apiStatus.className = "api-status error";

        }

    }


    // ==========================================
    // 10. GENERATE PROPERTY CARDS USING MAP()
    // ==========================================

    function createPropertyCard(property) {

        const isSaved = savedProperties.has(property.id);

        const isCompared = compareSelection.has(property.id);


        const typeName = titleCase(property.type);


        const statusClass = property.availability
            .toLowerCase()
            .replace(/\s+/g, "-");


        return `

            <article class="property-card">

                <div class="card-image">

                    <img
                        src="${escapeHTML(property.image)}"
                        alt="${escapeHTML(property.title)}"
                        loading="lazy">


                    <span class="property-badge">

                        ${escapeHTML(property.badge)}

                    </span>


                    <!-- Favourite Button -->

                    <button
                        type="button"
                        class="favorite-button ${isSaved ? "saved" : ""}"
                        data-favorite="${escapeHTML(property.id)}"
                        aria-label="${isSaved ? "Remove from favourites" : "Save to favourites"}"
                        aria-pressed="${isSaved}">

                        ${isSaved ? "♥" : "♡"}

                    </button>


                    <!-- Property Type -->

                    <span class="type-badge">

                        ${escapeHTML(typeName)}

                    </span>

                </div>


                <div class="card-content">


                    <!-- Location -->

                    <div class="card-location">

                        <span class="location-icon">⌖</span>

                        ${escapeHTML(property.location)}

                    </div>


                    <!-- Property Name -->

                    <h3>

                        ${escapeHTML(property.title)}

                    </h3>


                    <!-- Property Features -->

                    <div class="card-features">

                        <span>
                            🛏 ${property.bedrooms} Beds
                        </span>

                        <span>
                            ▣ ${property.bathrooms} Baths
                        </span>

                        <span>
                            ⌂ ${property.area.toLocaleString("en-IN")} sq.ft.
                        </span>

                    </div>


                    <!-- Furnishing Information -->

                    <div class="card-furnishing">

                        ${escapeHTML(property.furnishing)}

                    </div>


                    <!-- Availability Status -->

                    <div style="margin-top: 10px;">

                        <span class="availability-badge status-${statusClass}">

                            ${escapeHTML(property.availability)}

                        </span>

                    </div>


                    <!-- Price and Details -->

                    <div class="card-footer">

                        <div class="price-block">

                            <strong>
                                ${formatPrice(property.price)}
                            </strong>

                            <span>/ month</span>

                        </div>


                        <button
                            type="button"
                            class="view-details-button"
                            data-view="${escapeHTML(property.id)}">

                            View Details →

                        </button>

                    </div>


                    <!-- Compare Button -->

                    <div class="card-compare">

                        <button
                            type="button"
                            class="compare-button ${isCompared ? "selected" : ""}"
                            data-compare="${escapeHTML(property.id)}"
                            aria-pressed="${isCompared}">

                            ${isCompared
                                ? "✓ Added to Compare"
                                : "+ Add to Compare"}

                        </button>

                    </div>

                </div>

            </article>

        `;

    }


    // ==========================================
    // 11. CHECK PRICE RANGE
    // ==========================================

    function matchesBudget(price, budget) {

        switch (budget) {

            case "under-20000":

                return price < 20000;


            case "20000-50000":

                return price >= 20000 && price < 50000;


            case "50000-plus":

                return price >= 50000;


            default:

                return true;

        }

    }


    // ==========================================
    // 12. CHECK BEDROOM FILTER
    // ==========================================

    function matchesBedrooms(bedrooms, selected) {

        if (selected === "all") {

            return true;

        }


        if (selected === "4-plus") {

            return bedrooms >= 4;

        }


        return bedrooms === Number(selected);

    }


    // ==========================================
    // 13. FILTER PROPERTIES USING FILTER()
    // ==========================================

    function filterProperties() {

        const searchText = elements.searchInput.value
            .toLowerCase()
            .trim();


        const selectedType = elements.typeFilter.value;

        const selectedBedrooms = elements.bedroomFilter.value;

        const selectedBudget = elements.budgetFilter.value;

        const selectedFurnishing = elements.furnishingFilter.value;

        const selectedAvailability = elements.availabilityFilter.value;

        const selectedAmenity = elements.amenityFilter.value;

        const selectedSort = elements.sortSelect.value;


        // Filter records according to user requirements.

        filteredProperties = properties.filter(function (property) {


            // Search by title, location, type or description.

            const searchableText = [

                property.title,

                property.location,

                property.type,

                property.badge,

                property.description

            ].join(" ").toLowerCase();


            const matchesSearch =
                searchableText.includes(searchText);


            // Property Type Filter

            const matchesType =
                selectedType === "all" ||
                property.type === selectedType;


            // Bedroom Filter

            const matchesBedroom =
                matchesBedrooms(
                    property.bedrooms,
                    selectedBedrooms
                );


            // Budget Filter

            const matchesPrice =
                matchesBudget(
                    property.price,
                    selectedBudget
                );


            // Furnishing Filter

            const matchesFurnishing =
                selectedFurnishing === "all" ||
                property.furnishing === selectedFurnishing;


            // Availability Filter

            const matchesAvailability =
                selectedAvailability === "all" ||
                property.availability === selectedAvailability;


            // Amenities Filter

            const matchesAmenity =
                selectedAmenity === "all" ||
                property.amenities.includes(selectedAmenity);


            // Favourite Filter

            const matchesFavorite =
                !showFavoritesOnly ||
                savedProperties.has(property.id);


            return (

                matchesSearch &&
                matchesType &&
                matchesBedroom &&
                matchesPrice &&
                matchesFurnishing &&
                matchesAvailability &&
                matchesAmenity &&
                matchesFavorite

            );

        });


        // ======================================
        // 14. SORT PROPERTIES USING SORT()
        // ======================================

        if (selectedSort === "price-low") {

            filteredProperties.sort(function (a, b) {

                return a.price - b.price;

            });

        }

        else if (selectedSort === "price-high") {

            filteredProperties.sort(function (a, b) {

                return b.price - a.price;

            });

        }

        else if (selectedSort === "area-high") {

            filteredProperties.sort(function (a, b) {

                return b.area - a.area;

            });

        }

        else if (selectedSort === "newest") {

            filteredProperties.sort(function (a, b) {

                const dateA = Date.parse(a.dateAdded) || 0;

                const dateB = Date.parse(b.dateAdded) || 0;

                return dateB - dateA;

            });

        }

        else {

            // Featured properties appear first.

            filteredProperties.sort(function (a, b) {

                return Number(b.featured) - Number(a.featured);

            });

        }


        // Start pagination from first page after a new filter.

        visibleLimit = PAGE_SIZE;


        // Display results.

        renderPropertyResults();

        updatePropertyInsights(filteredProperties);

        renderActiveFilters();

    }


    // ==========================================
    // 15. DISPLAY PROPERTY RESULTS
    // ==========================================

    function renderPropertyResults() {

        const visibleProperties = filteredProperties.slice(
            0,
            visibleLimit
        );


        elements.propertyGrid.innerHTML = visibleProperties

            .map(createPropertyCard)

            .join("");


        if (filteredProperties.length === 0) {

            elements.resultsCount.textContent =
                "No matching properties found.";


            elements.emptyState.hidden = false;


            const heading =
                elements.emptyState.querySelector("h3");

            const message =
                elements.emptyState.querySelector("p");

            const resetButton =
                elements.emptyState.querySelector("button");


            if (heading) {

                heading.textContent = "No properties found";

            }


            if (message) {

                message.textContent =
                    "Try changing your search or filters to find more properties.";

            }


            if (resetButton) {

                resetButton.hidden = false;

            }

        }

        else {

            elements.resultsCount.textContent =

                `Showing ${visibleProperties.length} of ${filteredProperties.length} matching properties`;


            elements.emptyState.hidden = true;

        }


        updateLoadMore();

    }


    // ==========================================
    // 16. LOAD MORE PROPERTIES USING SLICE()
    // ==========================================

    function updateLoadMore() {

        const hasMore =

            visibleLimit < filteredProperties.length;


        elements.loadMoreWrap.hidden = !hasMore;

    }


    elements.loadMoreButton.addEventListener("click", function () {

        visibleLimit += PAGE_SIZE;

        renderPropertyResults();

    });


    // ==========================================
    // 17. PROPERTY INSIGHTS USING REDUCE()
    // ==========================================

    function updatePropertyInsights(list) {

        if (list.length === 0) {

            elements.insightCount.textContent = "0";

            elements.averageRent.textContent = "—";

            elements.lowestRent.textContent = "—";

            elements.popularType.textContent = "—";

            return;

        }


        // Calculate total rent, lowest rent
        // and counts of property types.

        const summary = list.reduce(

            function (result, property) {


                // Add property rent to total.

                result.totalRent += property.price;


                // Calculate lowest rent.

                result.lowestRent = Math.min(

                    result.lowestRent,

                    property.price

                );


                // Count property types.

                result.typeCounts[property.type] =

                    (result.typeCounts[property.type] || 0) + 1;


                return result;

            },


            {

                totalRent: 0,

                lowestRent: Infinity,

                typeCounts: {}

            }

        );


        // Average monthly rent.

        const average = Math.round(

            summary.totalRent / list.length

        );


        // Get the highest number of listings for a type.

        const maxCount = Math.max(

            ...Object.values(summary.typeCounts)

        );


        // Find ALL property types having that count.
        // This correctly handles ties.

        const popularTypes = Object.entries(summary.typeCounts)

            .filter(function ([type, count]) {

                return count === maxCount;

            })

            .map(function ([type]) {

                return titleCase(type);

            });


        // Update insight cards.

        elements.insightCount.textContent = list.length;

        elements.averageRent.textContent = formatPrice(average);

        elements.lowestRent.textContent =
            formatPrice(summary.lowestRent);


        // Display tie instead of incorrectly selecting one type.

        elements.popularType.textContent =

            popularTypes.length > 1

                ? "Tie: " + popularTypes.join(", ")

                : popularTypes[0];

    }


    // ==========================================
    // 18. ACTIVE FILTER CHIPS
    // ==========================================

    function renderActiveFilters() {

        const filters = [];


        function addFilter(key, label) {

            filters.push({
                key: key,
                label: label
            });

        }


        if (elements.searchInput.value.trim()) {

            addFilter(
                "search",
                `Search: ${elements.searchInput.value.trim()}`
            );

        }


        if (elements.typeFilter.value !== "all") {

            addFilter(
                "type",
                `Type: ${titleCase(elements.typeFilter.value)}`
            );

        }


        if (elements.bedroomFilter.value !== "all") {

            addFilter(
                "bedrooms",
                elements.bedroomFilter.selectedOptions[0].textContent.trim()
            );

        }


        if (elements.budgetFilter.value !== "all") {

            addFilter(
                "budget",
                elements.budgetFilter.selectedOptions[0].textContent.trim()
            );

        }


        if (elements.furnishingFilter.value !== "all") {

            addFilter(
                "furnishing",
                elements.furnishingFilter.value
            );

        }


        if (elements.availabilityFilter.value !== "all") {

            addFilter(
                "availability",
                elements.availabilityFilter.value
            );

        }


        if (elements.amenityFilter.value !== "all") {

            addFilter(
                "amenity",
                `Amenity: ${elements.amenityFilter.value}`
            );

        }


        if (showFavoritesOnly) {

            addFilter(
                "favorites",
                "Saved properties only"
            );

        }


        // Generate filter chips using map().

        elements.activeFilters.innerHTML = filters.map(function (filter) {

            return `

                <span class="filter-chip">

                    ${escapeHTML(filter.label)}

                    <button
                        type="button"
                        data-clear-filter="${filter.key}"
                        aria-label="Remove ${escapeHTML(filter.label)}">

                        ×

                    </button>

                </span>

            `;

        }).join("");

    }


    // ==========================================
    // 19. REMOVE INDIVIDUAL FILTER CHIPS
    // ==========================================

    elements.activeFilters.addEventListener("click", function (event) {

        const button = event.target.closest("[data-clear-filter]");

        if (!button) return;


        const key = button.dataset.clearFilter;


        const resetters = {

            search: function () {
                elements.searchInput.value = "";
            },

            type: function () {
                elements.typeFilter.value = "all";
            },

            bedrooms: function () {
                elements.bedroomFilter.value = "all";
            },

            budget: function () {
                elements.budgetFilter.value = "all";
            },

            furnishing: function () {
                elements.furnishingFilter.value = "all";
            },

            availability: function () {
                elements.availabilityFilter.value = "all";
            },

            amenity: function () {
                elements.amenityFilter.value = "all";
            },

            favorites: function () {
                showFavoritesOnly = false;
            }

        };


        if (resetters[key]) {

            resetters[key]();

            updateFavoritesButton();

            filterProperties();

        }

    });


    // ==========================================
    // 20. FAVOURITE PROPERTIES
    // ==========================================

    function updateFavoritesButton() {

        elements.favoritesToggle.textContent =

            `♡ Saved (${savedProperties.size})`;


        elements.favoritesToggle.classList.toggle(

            "active",

            showFavoritesOnly

        );


        elements.favoritesToggle.setAttribute(

            "aria-pressed",

            String(showFavoritesOnly)

        );

    }


    function toggleFavorite(propertyId) {

        if (savedProperties.has(propertyId)) {

            savedProperties.delete(propertyId);

            showToast("Property removed from favourites.");

        }

        else {

            savedProperties.add(propertyId);

            showToast("Property added to favourites.");

        }


        writeStoredArray(

            FAVORITES_KEY,

            [...savedProperties]

        );


        updateFavoritesButton();

        filterProperties();

        renderRecentlyViewed();

    }


    elements.favoritesToggle.addEventListener("click", function () {

        showFavoritesOnly = !showFavoritesOnly;


        updateFavoritesButton();

        filterProperties();


        showToast(

            showFavoritesOnly

                ? "Showing your saved properties."

                : "Showing all matching properties."

        );

    });


    // ==========================================
    // 21. COMPARE TOOLBAR
    // ==========================================

    function updateCompareToolbar() {

        elements.compareToolbar.hidden =

            compareSelection.size === 0;


        elements.compareCount.textContent =

            `${compareSelection.size} of ${MAX_COMPARE} properties selected`;


        elements.compareButton.disabled =

            compareSelection.size < 2;

    }


    function toggleComparison(propertyId) {

        if (compareSelection.has(propertyId)) {

            compareSelection.delete(propertyId);

            showToast("Property removed from comparison.");

        }

        else {

            if (compareSelection.size >= MAX_COMPARE) {

                showToast(
                    "You can compare a maximum of three properties."
                );

                return;

            }


            compareSelection.add(propertyId);

            showToast("Property added to comparison.");

        }


        updateCompareToolbar();

        renderPropertyResults();

        renderRecentlyViewed();

    }


    // ==========================================
    // 22. COMPARE SELECTED PROPERTIES
    // ==========================================

    function openComparison() {

        const selectedProperties = [...compareSelection]

            .map(getPropertyById)

            .filter(Boolean);


        if (selectedProperties.length < 2) {

            showToast(
                "Select at least two properties to compare."
            );

            return;

        }


        // Generate table header.

        elements.compareTableHead.innerHTML = `

            <tr>

                <th>Features</th>

                ${selectedProperties.map(function (property) {

                    return `<th>${escapeHTML(property.title)}</th>`;

                }).join("")}

            </tr>

        `;


        // Features to compare.

        const comparisonRows = [

            {

                label: "Property Type",

                value: property => titleCase(property.type)

            },

            {

                label: "Location",

                value: property => property.location

            },

            {

                label: "Monthly Rent",

                value: property => formatPrice(property.price)

            },

            {

                label: "Bedrooms",

                value: property => property.bedrooms

            },

            {

                label: "Bathrooms",

                value: property => property.bathrooms

            },

            {

                label: "Area",

                value: property =>
                    `${property.area.toLocaleString("en-IN")} sq.ft.`

            },

            {

                label: "Furnishing",

                value: property => property.furnishing

            },

            {

                label: "Availability",

                value: property => property.availability

            },

            {

                label: "Amenities",

                value: property =>
                    property.amenities.join(", ") || "Not specified"

            }

        ];


        // Generate comparison rows.

        elements.compareTableBody.innerHTML = comparisonRows

            .map(function (row) {

                return `

                    <tr>

                        <th>${escapeHTML(row.label)}</th>

                        ${selectedProperties.map(function (property) {

                            return `

                                <td>

                                    ${escapeHTML(row.value(property))}

                                </td>

                            `;

                        }).join("")}

                    </tr>

                `;

            })

            .join("");


        elements.compareDialog.showModal();

    }


    elements.compareButton.addEventListener(

        "click",

        openComparison

    );


    // Clear comparison selections.

    elements.clearCompare.addEventListener("click", function () {

        compareSelection.clear();

        updateCompareToolbar();

        renderPropertyResults();

        renderRecentlyViewed();

        showToast("Comparison selection cleared.");

    });


    // Close comparison popup.

    elements.closeCompareDialog.addEventListener("click", function () {

        elements.compareDialog.close();

    });


    // Click outside comparison popup.

    elements.compareDialog.addEventListener("click", function (event) {

        if (event.target === elements.compareDialog) {

            elements.compareDialog.close();

        }

    });


    // ==========================================
    // 23. RECENTLY VIEWED PROPERTIES
    // ==========================================

    function saveRecentlyViewed() {

        writeStoredArray(

            RECENT_KEY,

            recentlyViewed

        );

    }


    function recordRecentlyViewed(propertyId) {

        // Remove duplicate and add newest item first.

        recentlyViewed = [

            propertyId,

            ...recentlyViewed.filter(function (id) {

                return id !== propertyId;

            })

        ].slice(0, MAX_RECENT);


        saveRecentlyViewed();

        renderRecentlyViewed();

    }


    function renderRecentlyViewed() {

        const recentProperties = recentlyViewed

            .map(getPropertyById)

            .filter(Boolean);


        elements.recentSection.hidden =

            recentProperties.length === 0;


        elements.recentGrid.innerHTML = recentProperties

            .map(createPropertyCard)

            .join("");

    }


    // Clear history.

    elements.clearRecent.addEventListener("click", function () {

        recentlyViewed = [];

        saveRecentlyViewed();

        renderRecentlyViewed();

        showToast("Recently viewed history cleared.");

    });


    // ==========================================
    // 24. PROPERTY DETAILS POPUP
    // ==========================================

    function openPropertyDetails(propertyId) {

        const property = getPropertyById(propertyId);


        if (!property) {

            showToast("Property details could not be found.");

            return;

        }


        currentPropertyId = property.id;


        // Main property information.

        elements.modalImage.src = property.image;

        elements.modalImage.alt = property.title;

        elements.modalBadge.textContent = property.badge;

        elements.modalType.textContent = titleCase(property.type);

        elements.modalTitle.textContent = property.title;

        elements.modalLocation.textContent = property.location;

        elements.modalPrice.textContent = formatPrice(property.price);

        elements.modalAvailability.textContent =
            `Availability: ${property.availability}`;

        elements.modalFurnishing.textContent =
            `Furnishing: ${property.furnishing}`;

        elements.modalDescription.textContent = property.description;


        // Property features.

        elements.modalFacts.innerHTML = `

            <span>🛏 ${property.bedrooms} Bedrooms</span>

            <span>▣ ${property.bathrooms} Bathrooms</span>

            <span>
                ⌂ ${property.area.toLocaleString("en-IN")} sq.ft.
            </span>

        `;


        // Property amenities.

        elements.modalAmenities.innerHTML = property.amenities

            .map(function (amenity) {

                return `<li>${escapeHTML(amenity)}</li>`;

            })

            .join("");


        // Save recently viewed property.

        recordRecentlyViewed(property.id);


        // Open details popup.

        if (!elements.propertyDialog.open) {

            elements.propertyDialog.showModal();

        }

    }


    // ==========================================
    // 25. CLOSE PROPERTY DETAILS
    // ==========================================

    elements.closeDialog.addEventListener("click", function () {

        elements.propertyDialog.close();

    });


    elements.modalDone.addEventListener("click", function () {

        elements.propertyDialog.close();

    });


    elements.propertyDialog.addEventListener("click", function (event) {

        if (event.target === elements.propertyDialog) {

            elements.propertyDialog.close();

        }

    });


    // ==========================================
    // 26. SHARE PROPERTY
    // ==========================================

    async function shareProperty(propertyId) {

        const property = getPropertyById(propertyId);

        if (!property) return;


        const shareURL = new URL(window.location.href);


        // Add property ID to the URL.

        shareURL.searchParams.set(
            "property",
            property.id
        );


        shareURL.hash = "properties";


        const shareData = {

            title: property.title,

            text:
                `${property.title} in ${property.location}. ` +
                `${formatPrice(property.price)} per month.`,

            url: shareURL.href

        };


        try {

            // Use native sharing when available.

            if (navigator.share) {

                await navigator.share(shareData);

            }


            // Otherwise copy URL.

            else if (

                navigator.clipboard &&

                window.isSecureContext

            ) {

                await navigator.clipboard.writeText(shareURL.href);

                showToast(
                    "Property link copied to clipboard."
                );

            }


            // Last fallback.

            else {

                window.prompt(
                    "Copy this property link:",
                    shareURL.href
                );

            }

        }

        catch (error) {

            if (error.name !== "AbortError") {

                console.error(
                    "Unable to share property:",
                    error
                );

                showToast("Could not share this property.");

            }

        }

    }


    elements.modalShare.addEventListener("click", function () {

        if (currentPropertyId !== null) {

            shareProperty(currentPropertyId);

        }

    });


    // ==========================================
    // 27. PROPERTY CARD EVENT DELEGATION
    // ==========================================

    // One handler works for both listing cards
    // and recently viewed cards.

    function handlePropertyGridClick(event) {

        const target = event.target instanceof Element

            ? event.target

            : null;


        if (!target) return;


        // Favourite click.

        const favoriteButton = target.closest("[data-favorite]");

        if (favoriteButton) {

            toggleFavorite(
                String(favoriteButton.dataset.favorite)
            );

            return;

        }


        // Compare click.

        const compareAction = target.closest("[data-compare]");

        if (compareAction) {

            toggleComparison(
                String(compareAction.dataset.compare)
            );

            return;

        }


        // View details click.

        const viewButton = target.closest("[data-view]");

        if (viewButton) {

            openPropertyDetails(
                String(viewButton.dataset.view)
            );

        }

    }


    elements.propertyGrid.addEventListener(
        "click",
        handlePropertyGridClick
    );


    elements.recentGrid.addEventListener(
        "click",
        handlePropertyGridClick
    );


    // ==========================================
    // 28. QUICK SEARCH
    // ==========================================

    document.querySelectorAll(".quick-chip").forEach(function (button) {

        button.addEventListener("click", function () {

            elements.searchInput.value =
                button.dataset.query || "";

            filterProperties();


            document.getElementById("properties").scrollIntoView({

                behavior: "smooth"

            });

        });

    });


    // ==========================================
    // 29. INDIVIDUAL FILTER CHIP REMOVAL
    // ==========================================

    elements.activeFilters.addEventListener("click", function (event) {

        const button = event.target.closest("[data-clear-filter]");

        if (!button) return;


        const resetters = {

            search: function () {
                elements.searchInput.value = "";
            },

            type: function () {
                elements.typeFilter.value = "all";
            },

            bedrooms: function () {
                elements.bedroomFilter.value = "all";
            },

            budget: function () {
                elements.budgetFilter.value = "all";
            },

            furnishing: function () {
                elements.furnishingFilter.value = "all";
            },

            availability: function () {
                elements.availabilityFilter.value = "all";
            },

            amenity: function () {
                elements.amenityFilter.value = "all";
            },

            favorites: function () {
                showFavoritesOnly = false;
            }

        };


        const key = button.dataset.clearFilter;


        if (resetters[key]) {

            resetters[key]();

            updateFavoritesButton();

            filterProperties();

        }

    });


    // ==========================================
    // 30. CLEAR ALL FILTERS
    // ==========================================

    function resetFilters() {

        elements.searchInput.value = "";

        elements.typeFilter.value = "all";

        elements.bedroomFilter.value = "all";

        elements.budgetFilter.value = "all";

        elements.furnishingFilter.value = "all";

        elements.availabilityFilter.value = "all";

        elements.amenityFilter.value = "all";

        elements.sortSelect.value = "recommended";


        showFavoritesOnly = false;


        updateFavoritesButton();

        filterProperties();

    }


    // ==========================================
    // 31. SEARCH AND FILTER EVENT LISTENERS
    // ==========================================

    elements.filterForm.addEventListener("submit", function (event) {

        event.preventDefault();

        filterProperties();

    });


    // Search updates while typing.

    elements.searchInput.addEventListener(
        "input",
        filterProperties
    );


    // Dropdown filters.

    [

        elements.typeFilter,

        elements.bedroomFilter,

        elements.budgetFilter,

        elements.furnishingFilter,

        elements.availabilityFilter,

        elements.amenityFilter,

        elements.sortSelect

    ].forEach(function (element) {

        element.addEventListener(
            "change",
            filterProperties
        );

    });


    // Clear all filters.

    elements.clearFilters.addEventListener(
        "click",
        resetFilters
    );


    elements.resetEmpty.addEventListener(
        "click",
        resetFilters
    );


    // ==========================================
    // 32. JSON SERVER RETRY CONNECTION
    // ==========================================

    elements.apiStatus.addEventListener("click", function (event) {

        if (event.target.closest("[data-retry-api]")) {

            loadProperties();

        }

    });


    // ==========================================
    // 33. INITIALIZE LISTING PAGE
    // ==========================================

    updateFavoritesButton();

    updateCompareToolbar();

    renderRecentlyViewed();

    loadProperties();


    console.log(
        "NestKey Property Listings initialized successfully."
    );

});
