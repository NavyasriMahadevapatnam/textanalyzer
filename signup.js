import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('signup-error');

    // Clear previous error
    errorEl.style.display = 'none';

    // Basic validation
    if (password.length < 6) {
        errorEl.innerText = "Password must be at least 6 characters long.";
        errorEl.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        errorEl.innerText = "Passwords do not match!";
        errorEl.style.display = 'block';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Add the Name to the Firebase user profile
        await updateProfile(userCredential.user, {
            displayName: name
        });

        // Store additional details in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name,
            email: email,
            createdAt: new Date().toISOString()
        });

        // Account created successfully
        alert("Account details successfully added to Firebase! Please log in.");
        
        // we sign out here and redirect to login
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            errorEl.innerText = "An account with this email already exists.";
        } else {
            errorEl.innerText = error.message;
        }
        errorEl.style.display = 'block';
    }
});
