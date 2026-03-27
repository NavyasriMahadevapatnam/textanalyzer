import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// Check if already logged in via Firebase
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'index.html';
    }
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    errorEl.style.display = 'none';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        window.location.href = 'index.html';
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            errorEl.innerText = "Invalid email or password.";
        } else {
            errorEl.innerText = error.message;
        }
        errorEl.style.display = 'block';
    }
});
