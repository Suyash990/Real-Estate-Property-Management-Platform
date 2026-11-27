
// Main Property Image
let mainImage = document.querySelector(".property-image img");

// Gallery Images
let galleryImages = document.querySelectorAll(".gallery img");

// Change Main Image when Gallery Image is Clicked
galleryImages.forEach(function(image) {

    image.addEventListener("click", function() {

        let temp = mainImage.src;

        mainImage.src = this.src;
        this.src = temp;

        mainImage.alt = this.alt;

    });

});


// Contact Owner Button
let contactButton = document.querySelector(".contact-btn");

contactButton.addEventListener("click", function() {

    document.querySelector(".contact-section").scrollIntoView({
        behavior: "smooth"
    });

});


// Contact Form
let contactForm = document.querySelector("form");

contactForm.addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.querySelector("#name").value.trim();
    let email = document.querySelector("#email").value.trim();
    let phone = document.querySelector("#phone").value.trim();
    let message = document.querySelector("#message").value.trim();

    // Check Empty Fields
    if (name === "" || email === "" || phone === "" || message === "") {

        alert("Please fill all the fields!");
        return;

    }

    // Check Phone Number
    if (!/^[0-9]{10}$/.test(phone)) {

        alert("Please enter a valid 10 digit phone number!");
        return;

    }

    // Check Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        alert("Please enter a valid email address!");
        return;

    }

    // Successful Submission
    alert("Thank you " + name + "! Your enquiry has been submitted successfully.");

    contactForm.reset();

});
