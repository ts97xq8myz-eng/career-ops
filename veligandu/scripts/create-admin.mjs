/**
 * One-time script to create the admin user in Firebase Auth.
 * Run ONCE from Cloud Shell after deployment:
 *   node scripts/create-admin.mjs
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or firebase-admin service account.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "veligandu-3cc65";

// If running in Cloud Shell / GCE the default credentials are used automatically.
initializeApp({ projectId: PROJECT_ID });

const auth = getAuth();

const ADMIN_EMAIL    = "admin@veligandu.com";
const ADMIN_PASSWORD = "RS@Veligandu2025!";

try {
  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log("Admin user already exists:", user.uid);
    await auth.updateUser(user.uid, { password: ADMIN_PASSWORD, displayName: "Veligandu Admin" });
    console.log("Password updated.");
  } catch {
    user = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: "Veligandu Admin",
      emailVerified: true,
    });
    console.log("Admin user created:", user.uid);
  }
  console.log("\n=== ADMIN CREDENTIALS ===");
  console.log("Email   :", ADMIN_EMAIL);
  console.log("Password:", ADMIN_PASSWORD);
  console.log("URL     : https://veligandumaldives.reservationsandsales.com/admin/login");
  console.log("=========================\n");
} catch (err) {
  console.error("Failed to create admin user:", err.message);
  process.exit(1);
}
