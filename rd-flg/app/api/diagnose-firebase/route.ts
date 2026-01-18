import { NextResponse } from "next/server";
import admin from "firebase-admin";

export const runtime = "nodejs";

/**
 * Diagnostic endpoint to check Firebase credentials
 * Visit: http://localhost:3000/api/diagnose-firebase
 */
export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    step1_envVariables: {} as any,
    step2_privateKeyFormat: {} as any,
    step3_initialization: {} as any,
    step4_connection: {} as any,
  };

  // Step 1: Check if environment variables exist
  console.log("🔍 Step 1: Checking environment variables...");
  
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  diagnostics.step1_envVariables = {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: {
      exists: !!projectId,
      value: projectId || "❌ NOT SET",
    },
    FIREBASE_CLIENT_EMAIL: {
      exists: !!clientEmail,
      value: clientEmail || "❌ NOT SET",
    },
    FIREBASE_PRIVATE_KEY: {
      exists: !!privateKey,
      length: privateKey?.length || 0,
    },
  };

  if (!projectId || !clientEmail || !privateKey) {
    return NextResponse.json({
      ...diagnostics,
      error: "❌ Missing required environment variables",
      nextSteps: [
        "1. Check that .env.local exists in your project root",
        "2. Verify all three variables are set",
        "3. Restart your dev server after adding them",
      ],
    }, { status: 500 });
  }

  // Step 2: Validate private key format
  console.log("🔍 Step 2: Validating private key format...");
  
  diagnostics.step2_privateKeyFormat = {
    totalLength: privateKey.length,
    startsWithBegin: privateKey.startsWith("-----BEGIN"),
    endsWithEnd: privateKey.includes("END PRIVATE KEY"),
    hasBackslashN: privateKey.includes("\\n"),
    hasActualNewlines: privateKey.includes("\n"),
    firstChars: privateKey.substring(0, 30),
    lastChars: privateKey.substring(privateKey.length - 30),
  };

  // Try to replace \\n with actual newlines
  const processedKey = privateKey.replace(/\\n/g, "\n");
  diagnostics.step2_privateKeyFormat.afterProcessing = {
    length: processedKey.length,
    lineCount: processedKey.split("\n").length,
    startsCorrectly: processedKey.startsWith("-----BEGIN PRIVATE KEY-----"),
  };

  // Step 3: Try to initialize Firebase Admin
  console.log("🔍 Step 3: Attempting Firebase Admin initialization...");
  
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      diagnostics.step3_initialization = {
        status: "✅ Already initialized",
        appCount: admin.apps.length,
      };
    } else {
      // Try to initialize
      const serviceAccount = {
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: processedKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
      });

      diagnostics.step3_initialization = {
        status: "✅ Successfully initialized",
        projectId: admin.app().options.projectId,
      };
    }
  } catch (error: any) {
    diagnostics.step3_initialization = {
      status: "❌ FAILED",
      error: error.message,
      code: error.code,
      possibleReasons: [
        "Private key format is incorrect",
        "Service account credentials are invalid",
        "Project ID doesn't match the service account",
      ],
    };

    return NextResponse.json({
      ...diagnostics,
      error: "❌ Firebase Admin initialization failed",
      details: error.message,
    }, { status: 500 });
  }

  // Step 4: Try to connect to Firestore
  console.log("🔍 Step 4: Testing Firestore connection...");
  
  try {
    const db = admin.firestore();

    // Try to write a test document
    const testRef = db.collection("_diagnostic_test").doc("test");
    await testRef.set({
      timestamp: new Date().toISOString(),
      test: true,
    });

    // Try to read it back
    const doc = await testRef.get();
    const data = doc.data();

    // Clean up
    await testRef.delete();

    diagnostics.step4_connection = {
      status: "✅ SUCCESS",
      canWrite: true,
      canRead: doc.exists,
      dataMatches: data?.test === true,
    };
  } catch (error: any) {
    diagnostics.step4_connection = {
      status: "❌ FAILED",
      error: error.message,
      code: error.code,
      reason: error.reason,
      details: error.details,
      possibleReasons: [
        "Service account doesn't have Firestore permissions",
        "Firestore is not enabled for this project",
        "Authentication credentials are expired or invalid",
      ],
    };

    return NextResponse.json({
      ...diagnostics,
      error: "❌ Firestore connection failed",
      details: error.message,
      recommendation: error.reason === "ACCESS_TOKEN_EXPIRED" 
        ? "Your service account credentials appear to be invalid. Download a fresh service account key from Firebase Console."
        : "Check Firebase Console to ensure Firestore is enabled and the service account has proper permissions.",
    }, { status: 500 });
  }

  // All checks passed!
  return NextResponse.json({
    ...diagnostics,
    summary: "✅ All diagnostics passed! Firebase is properly configured.",
    recommendation: "Your Firebase setup is working correctly. If you're still seeing errors in other endpoints, they may be using a different configuration.",
  });
}