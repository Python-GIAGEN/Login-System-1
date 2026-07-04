import { auth } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { sanitizeEmail, isValidEmail, isValidPassword } from "./sanitize.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = sanitizeEmail(document.getElementById("email").value);
  const pw = document.getElementById("password").value;
  const pw2 = document.getElementById("password2").value;

  if (!isValidEmail(email)) return alert("Ungültige E-Mail.");
  if (!isValidPassword(pw)) return alert("Passwort zu kurz.");
  if (pw !== pw2) return alert("Passwörter stimmen nicht überein.");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pw);
    const user = userCred.user;

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    await sendEmailVerification(user);
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    alert("Bitte E-Mail bestätigen.");
    window.location.href = "/verify-email.html";
  } catch (err) {
    alert(err.message);
  }
});
