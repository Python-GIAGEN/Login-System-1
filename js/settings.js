import { auth } from "./firebase-init.js";
import {
  updateEmail,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { sanitizeEmail } from "./sanitize.js";

document.getElementById("changeEmailForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const newEmail = sanitizeEmail(document.getElementById("newEmail").value);

  try {
    await updateEmail(user, newEmail);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    await sendEmailVerification(user);
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    alert("Neue E-Mail gesetzt. Bitte verifizieren.");
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("changePwForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;

  const oldPw = document.getElementById("oldPw").value;
  const newPw = document.getElementById("newPw").value;
  const newPw2 = document.getElementById("newPw2").value;

  if (newPw !== newPw2) return alert("Neue Passwörter stimmen nicht.");

  try {
    const cred = EmailAuthProvider.credential(user.email, oldPw);
    await reauthenticateWithCredential(user, cred);

    await updatePassword(user, newPw);
    alert("Passwort geändert.");
  } catch (err) {
    alert(err.message);
  }
});
