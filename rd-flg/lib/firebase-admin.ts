// lib/firebase-admin.ts

import * as admin from "firebase-admin";

// This helper function handles the three most common parsing errors
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  return key
    .replace(/\\n/g, "\n")      // Converts literal '\n' strings to actual newlines
    .replace(/"/g, "")          // Removes accidental double quotes
    .trim();                    // Removes accidental leading/trailing spaces
};

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

export function getAdminDb() {
  if (!admin.apps.length) {
    if (!serviceAccount.privateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing or undefined");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
  return admin.firestore();
}