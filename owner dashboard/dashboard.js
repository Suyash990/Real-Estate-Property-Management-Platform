
// ==========================================
// NESTKEY - DASHBOARD JAVASCRIPT
// ==========================================

// 1. GET MAINTENANCE REQUESTS FROM LOCAL STORAGE

function getRequests() {
    let requests = localStorage.getItem("maintenanceRequests");

    if (requests === null) {
        return [];
    }

    return JSON.parse(requests);
}


// 2. SAVE MAINTENANCE REQUESTS IN LOCAL STORAGE

function saveRequests(requests) {
    localStorage.setItem("maintenanceRequests", JSON.stringify(requests));
}


// 3. DISPLAY MAINTENANCE REQUESTS

function displayRequests(containerId) {
    let container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    let requests = getRequests();

    container.innerHTML = "";

    if (requests.length === 0) {
        container.innerHTML = "<p>No maintenance requests yet.</p>";
        return;
    }

    // Display newest requests first
    requests.reverse().forEach(function(request) {

        let requestCard = document.createElement("div");
        requestCard.className = "request-card";

        let heading = document.createElement("h3");
        heading.textContent = request.issue;

        let description = document.createElement("p");
        description.textContent = request.description;

        let property = document.createElement("p");
        property.textContent = "Property: " + request.property;

        let date = document.createElement("p");
        date.textContent = "Requested Date: " + request.date;

        let status = document.createElement("span");
        status.className = "status pending";
        status.textContent = request.status;

        requestCard.appendChild(heading);
        requestCard.appendChild(description);
        requestCard.appendChild(property);
        requestCard.appendChild(date);
        requestCard.appendChild(status);

        container.appendChild(requestCard);
    });
}


// 4. HANDLE MAINTENANCE FORM SUBMISSION

let maintenanceForm = document.getElementById("maintenanceForm");

if (maintenanceForm) {

    maintenanceForm.addEventListener("submit", function(event) {

        event.preventDefault();

        let name = document.getElementById("name").value.trim();
        let property = document.getElementById("property").value.trim();
        let issue = document.getElementById("issue").value;
        let description = document.getElementById("description").value.trim();
        let date = document.getElementById("date").value;

        let message = document.getElementById("formMessage");

        // Validate form
        if (
            name === "" ||
            property === "" ||
            issue === "" ||
            description === "" ||
            date === ""
        ) {
            message.textContent = "Please fill in all fields.";
            message.className = "error-message";
            return;
        }

        // Create a new maintenance request
        let newRequest = {
            id: Date.now(),
            name: name,
            property: property,
            issue: issue,
            description: description,
            date: date,
            status: "Pending"
        };

        // Get existing requests
        let requests = getRequests();

        // Add new request
        requests.push(newRequest);

        // Save updated requests
        saveRequests(requests);

        // Show success message
        message.textContent = "Maintenance request submitted successfully!";
        message.className = "success-message";

        // Clear form
        maintenanceForm.reset();

        // Refresh request list
        displayRequests("maintenanceRequests");

        // Update dashboard count
        updateDashboard();
    });
}


// 5. SET MINIMUM DATE FOR MAINTENANCE REQUEST

let dateInput = document.getElementById("date");

if (dateInput) {

    let today = new Date();

    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = String(today.getDate()).padStart(2, "0");

    let currentDate = year + "-" + month + "-" + day;

    dateInput.setAttribute("min", currentDate);
}


// 6. UPDATE DASHBOARD REQUEST COUNT

function updateDashboard() {

    let requests = getRequests();

    let requestCount = document.getElementById("requestCount");

    if (requestCount) {
        requestCount.textContent = requests.length;
    }

    displayRequests("dashboardRequests");
}


// 7. RENT PAYMENT DEMO FUNCTIONALITY

let payRentButton = document.getElementById("payRentButton");

if (payRentButton) {

    payRentButton.addEventListener("click", function() {

        let confirmation = confirm(
            "Do you want to mark your rent as paid? This is only a demo."
        );

        if (confirmation) {

            localStorage.setItem("rentPaymentStatus", "Paid");

            updateRentStatus();

            alert("Rent status updated to Paid!");
        }
    });
}


// 8. UPDATE RENT PAYMENT STATUS

function updateRentStatus() {

    let rentStatus = document.getElementById("rentStatus");

    if (!rentStatus) {
        return;
    }

    let paymentStatus = localStorage.getItem("rentPaymentStatus");

    if (paymentStatus === null) {
        paymentStatus = "Pending";
    }

    rentStatus.textContent = paymentStatus;

    if (paymentStatus === "Paid") {
        rentStatus.className = "status paid";
    } else {
        rentStatus.className = "status pending";
    }
}


// 9. INITIALIZE DASHBOARD AND MAINTENANCE PAGE

updateDashboard();

displayRequests("maintenanceRequests");

updateRentStatus();
