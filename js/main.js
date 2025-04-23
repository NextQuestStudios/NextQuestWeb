import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  doc, setDoc, getDoc, addDoc, collection, serverTimestamp, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Show admin nav item if user has admin or owner role
const adminNav = document.getElementById("adminNav");
onAuthStateChanged(auth, async (user) => {
  if (user && adminNav) {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const role = snap.data().role;
      if (role === "admin" || role === "owner") {
        adminNav.style.display = "inline-block";
      }
    }
  }
});

// --- Signup Logic ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  const passwordInput = document.getElementById("signupPassword");
  const confirmPasswordInput = document.getElementById("signupConfirmPassword");
  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const val = passwordInput.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[a-z]/.test(val)) strength++;
      if (/\d/.test(val)) strength++;
      if (/[\W_]/.test(val)) strength++;

      const labels = ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"];
      const colors = ["#ff4d4d", "#ffa94d", "#f2e94e", "#4dd66d", "#4db8ff"];
      strengthFill.style.width = `${(strength / 5) * 100}%`;
      strengthFill.style.background = colors[strength - 1] || "#222";
      strengthText.textContent = "Password strength: " + (labels[strength - 1] || "-");
    });
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
    if (!valid) return alert("Password must meet all security rules.");
    if (password !== confirmPassword) return alert("Passwords do not match.");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      await updateProfile(user, { displayName: username });
      await setDoc(doc(db, "users", user.uid), {
        email, username, role: "user", createdAt: serverTimestamp(), verified: false
      });
      await sendEmailVerification(user);
      alert("Account created! Check your email to verify.");
      window.location.href = "login.html";
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });
}

// --- Login Logic ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!userCred.user.emailVerified) {
        alert("Please verify your email before logging in.");
        return;
      }
      window.location.href = "profile.html";
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}

// --- Logout ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "login.html");
  });
}

// --- Profile Page ---
const userEmail = document.getElementById("userEmail");
const userName = document.getElementById("userName");
const userBio = document.getElementById("userBio");
const saveProfileBtn = document.getElementById("saveProfileBtn");

onAuthStateChanged(auth, async (user) => {
  if (user && userEmail && userName && userBio && saveProfileBtn) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      userEmail.textContent = user.email;
      userName.textContent = data.username || user.displayName;
      userBio.value = data.bio || "";
    }
    saveProfileBtn.addEventListener("click", async () => {
      await setDoc(ref, { bio: userBio.value }, { merge: true });
      alert("Bio updated!");
    });
  }
});

// --- View Public User Profile ---
const viewUsername = document.getElementById("viewUsername");
const viewUserBio = document.getElementById("viewUserBio");
const params = new URLSearchParams(window.location.search);
const profileId = params.get("id");
if (profileId && viewUsername && viewUserBio) {
  const snap = await getDoc(doc(db, "users", profileId));
  if (snap.exists()) {
    const user = snap.data();
    viewUsername.textContent = user.username;
    viewUserBio.textContent = user.bio || "No bio set.";
  } else {
    viewUsername.textContent = "User not found";
    viewUserBio.textContent = "";
  }
}

// --- Support Ticket Submission ---
const supportForm = document.getElementById("supportForm");
if (supportForm) {
  supportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("supportName").value;
    const email = document.getElementById("supportEmail").value;
    const message = document.getElementById("supportMessage").value;

    try {
      await addDoc(collection(db, "tickets"), {
        name, email, message, createdAt: serverTimestamp()
      });
      alert("Your support ticket was submitted!");
      supportForm.reset();
    } catch (err) {
      alert("Failed to submit ticket: " + err.message);
    }
  });
}