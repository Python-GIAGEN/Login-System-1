// /js/settings.js

import { auth, db } from "./firebase-init.js";
import {
  updateEmail,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { sanitizeEmail } from "./sanitize.js";

// otplib aus globalem Namespace
const { authenticator } = window.otplib;

// -------------------- E-MAIL ÄNDERN --------------------
document.getElementById("changeEmailForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const newEmail = sanitizeEmail(document.getElementById("newEmail").value);

  try {
    await updateEmail(user, newEmail);
    await sendEmailVerification(user);
    alert("Neue E-Mail gesetzt. Bitte verifizieren.");
  } catch (err) {
    alert(err.message);
  }
});

// -------------------- PASSWORT ÄNDERN --------------------
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

// -------------------- HILFSFUNKTIONEN --------------------
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

async function load2FAState(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

// -------------------- 2FA AKTIVIEREN --------------------
document.getElementById("enable2FAForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("Nicht eingeloggt.");
    return;
  }

  // Secret generieren (Base32)
  const secret = authenticator.generateSecret();

  // otpauth URL bauen
  const otpauthUrl = authenticator.keyuri(user.email, "LorenzOpera", secret);

  // QR-Code zeichnen
  const canvas = document.getElementById("qrCanvas");
  window.QRCode.toCanvas(canvas, otpauthUrl, (error) => {
    if (error) console.error(error);
  });

  // manuellen Secret anzeigen
  document.getElementById("manualSecret").textContent = secret;

  // Backup-Codes generieren
  const backupCodes = generateBackupCodes(10);

  // in Firestore speichern
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    twoFAEnabled: false,
    twoFASecret: secret,
    backupCodes: backupCodes
  }, { merge: true });

  // Backup-Codes anzeigen
  const list = document.getElementById("backupList");
  list.innerHTML = "";
  backupCodes.forEach(code => {
    const li = document.createElement("li");
    li.textContent = code;
    list.appendChild(li);
  });

  document.getElementById("totpSetup").style.display = "block";
  document.getElementById("backupSection").style.display = "block";
});

// -------------------- 2FA BESTÄTIGEN --------------------
document.getElementById("confirmTotpBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Nicht eingeloggt.");
    return;
  }

  const code = document.getElementById("totpCode").value;
  if (!code || code.length < 6) {
    alert("Bitte gültigen 6-stelligen Code eingeben.");
    return;
  }

  const ref = doc(db, "users", user.uid);
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

  await updateDoc(ref, { twoFAEnabled: true });
  alert("2FA aktiviert.");
});

// -------------------- BACKUP-CODES NEU GENERIEREN --------------------
document.getElementById("regenBackupBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Nicht eingeloggt.");
    return;
  }

  const backupCodes = generateBackupCodes(10);
  const ref = doc(db, "users", user.uid);
  await updateDoc(ref, { backupCodes });

  const list = document.getElementById("backupList");
  list.innerHTML = "";
  backupCodes.forEach(code => {
    const li = document.createElement("li");
    li.textContent = code;
    list.appendChild(li);
  });

  alert("Neue Backup-Codes erstellt. Bitte sicher speichern!");
});
