import { auth } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { sanitizeEmail } from "./sanitize.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = sanitizeEmail(document.getElementById("email").value);
  const pw = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pw);
    const user = userCred.user;

    if (!user.emailVerified) {
      window.location.href = "/verify-email.html";
      return;
    }

    window.location.href = "/dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});

const provider = new GoogleAuthProvider();

document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "/dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});
