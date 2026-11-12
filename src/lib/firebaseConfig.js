import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhUm-e6PbVyNRtUatYZKFBVMb-YWc7MIc",
  authDomain: "educa360-dev.firebaseapp.com",
  projectId: "educa360-dev",
  storageBucket: "educa360-dev.firebasestorage.app",
  messagingSenderId: "101009225415",
  appId: "1:101009225415:web:4b5c267dfeb857b8d9b0e2",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

if (process.env.NODE_ENV === "development") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch (e) {
    // Ya conectado
  }
}

export { db, app, auth };