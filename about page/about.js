/* about.js - FAQ accordion + contact form validation */
"use strict";

// ---------- FAQ: click a question to open / close its answer ----------
document.getElementById("faq").addEventListener("click", function (e) {
  const question = e.target.closest(".faq-q");
  if (!question) return;

  const item = question.parentElement;
  const isOpen = item.classList.toggle("open");
  question.setAttribute("aria-expanded", isOpen);
});

// ---------- Contact form ----------
const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

document.getElementById("cSend").addEventListener("click", function () {
  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const message = document.getElementById("cMessage").value.trim();
  const msg = document.getElementById("cMsg");

  msg.className = "form-msg";

  if (name.length < 2) { msg.textContent = "Please enter your name."; return; }
  if (!emailPattern.test(email)) { msg.textContent = "Please enter a valid email address."; return; }
  if (message.length < 10) { msg.textContent = "Message must be at least 10 characters."; return; }

  // Demo only: there is no server to send this to.
  msg.className = "form-msg ok";
  msg.textContent = "Thank you, " + name.split(" ")[0] + "! We will get back to you soon.";
  document.getElementById("cName").value = "";
  document.getElementById("cEmail").value = "";
  document.getElementById("cMessage").value = "";
});
