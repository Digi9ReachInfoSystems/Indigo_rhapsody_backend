const admin = require("firebase-admin");
require("dotenv").config();

if (!admin.apps.length) {
  const decodedServiceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
      "utf8"
    )
  );

  admin.initializeApp({
    credential: admin.credential.cert(decodedServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const storage = admin.storage().bucket();

module.exports = {
  admin,
  storage,
};
