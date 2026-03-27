import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNCkxhGiKcBRAV1M59glkRgVNaJZinxeY",
  authDomain: "text-analyzer-304ce.firebaseapp.com",
  projectId: "text-analyzer-304ce",
  storageBucket: "text-analyzer-304ce.firebasestorage.app",
  messagingSenderId: "853732773981",
  appId: "1:853732773981:web:63ec24ce4560d070547db4",
  measurementId: "G-TCYPL1DJKP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
