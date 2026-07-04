import { auth } from "./firebase-init.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { sanitizeEmail } from "./sanitize.js";

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = sanitizeEmail(document.getElementById("email").value);

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Reset-Link gesendet.");
  } catch (err) {
    alert(err.message);
  }
});
