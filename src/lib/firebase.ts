// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, onSnapshot } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import { doc } from "firebase/firestore";
import { derived } from "svelte/store";
import type { Readable } from "svelte/store";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBE947AEucqWDWaptIYfkP6Lt51sjG3bZ8",
  authDomain: "myapp-ea520.firebaseapp.com",
  projectId: "myapp-ea520",
  storageBucket: "myapp-ea520.appspot.com",
  messagingSenderId: "246356952933",
  appId: "1:246356952933:web:037c15f0b61ca94e83438c",
  measurementId: "G-MT56NLVFWZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const databank = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

/**
 * @returns current firebase user
 */
function userStore() {
  if (!auth) {
    console.warn("Firebase auth not initialized");
    return writable<User | null>(null);
  }
  const store = writable<User | null>(auth.currentUser ?? null);
  const unsubscribe = onAuthStateChanged(auth, user => {
    store.set(user);
  });
  return {
    subscribe: store.subscribe,
    stop: () => unsubscribe()
  };
}

export const user = userStore();

/**
 * @returns a store with realtime updates on document data
 */
export function docStore<T>(path: string) {
  let unsubscribe: () => void;
  const docRef = doc(databank, path);
  const { subscribe } = writable<T | null>(null, (set) => {
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      set((snapshot.data() as T) ?? null);
    });
    return () => unsubscribe();
  });
  return {
    subscribe,
    ref: docRef,
    id: docRef.id,
    };
}

interface UserData {
  username: string;
  bio: string;
  photoURL: string;
  links: any[];
}

export const userData: Readable<UserData | null> = derived(user, ($user, set) => {
  if ($user) {
    return docStore<UserData>(`users/${$user.uid}`).subscribe(set);
  } else {
    set(null);
  }
});