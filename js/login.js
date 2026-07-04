// /js/login.js

import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { sanitizeEmail } from "./sanitize.js";

const { authenticator } = window.otplib;

let pendingUser = null; // User nach Passwort-Login, vor 2FA

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

    // 2FA-Status aus Firestore holen
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists() && snap.data().twoFAEnabled) {
      // 2FA erforderlich
      pendingUser = user;
      document.getElementById("twoFASection").style.display = "block";
    } else {
      // keine 2FA → direkt Dashboard
      window.location.href = "/dashboard.html";
    }
  } catch (err) {
    alert(err.message);
  }
});

// Google Login (ohne 2FA, optional später erweitern)
const provider = new GoogleAuthProvider();

document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    window.location.href = "/dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});

// 2FA UI Umschalten
document.getElementById("useTotpBtn").addEventListener("click", () => {
  document.getElementById("totpInput").style.display = "block";
  document.getElementById("backupInput").style.display = "none";
});

document.getElementById("useBackupBtn").addEventListener("click", () => {
  document.getElementById("backupInput").style.display = "block";
  document.getElementById("totpInput").style.display = "none";
});

// Authenticator-Code prüfen
document.getElementById("confirmTotpLoginBtn").addEventListener("click", async () => {
  if (!pendingUser) {
    alert("Kein Benutzer im 2FA-Status.");
    return;
  }

  const code = document.getElementById("totpLoginCode").value;
  if (!code || code.length < 6) {
    alert("Bitte gültigen 6-stelligen Code eingeben.");
    return;
  }

  const ref = doc(db, "users", pendingUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    alert("Kein 2FA-Setup gefunden.");
    return;
  }

  const data = snap.data();
  const secret = data.twoFASecret;

  const isValid = authenticator.check(code, secret);
  if (!isValid) {
    alert("Code ungültig.");
    return;
  }

  window.location.href = "/dashboard.html";
});

// Backup-Code prüfen
document.getElementById("confirmBackupLoginBtn").addEventListener("click", async () => {
  if (!pendingUser) {
    alert("Kein Benutzer im 2FA-Status.");
    return;
  }

  const code = document.getElementById("backupLoginCode").value.trim().toUpperCase();
  if (!code) {
    alert("Bitte Backup-Code eingeben.");
    return;
  }

  const ref = doc(db, "users", pendingUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    alert("Kein 2FA-Setup gefunden.");
    return;
  }

  const data = snap.data();
  const backupCodes = data.backupCodes || [];

  if (!backupCodes.includes(code)) {
    alert("Backup-Code ungültig.");
    return;
  }

  // verwendeten Backup-Code entfernen
  const newCodes = backupCodes.filter(c => c !== code);
  await updateDoc(ref, { backupCodes: newCodes });

  window.location.href = "/dashboard.html";
});
