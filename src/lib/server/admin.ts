import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

import pkg from "firebase-admin";

try {
    pkg.initializeApp({
        credential: pkg.credential.cert({
            projectId: process.env.FB_PROJECT_ID,
            clientEmail: process.env.FB_CLIENT_EMAIL,
            privateKey: process.env.FB_PRIVATE_KEY,
        }),
    });
} catch (err: any) {
    if (!/already exists/u.test(err.message)) {
        console.error("Firebase admin error: ", err.stack)
    }
}

export const adminAuth = getAuth();
export const adminDB = getFirestore();