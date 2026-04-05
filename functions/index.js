const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendPushNotification = onValueCreated(
  { ref: "/alerts/{alertId}", region: "europe-west1", instance: "ramex-talep-default-rtdb" },
  async (event) => {
    const alert = event.data.val();
    if (!alert || !alert.target) return null;

    const tokenSnap = await admin.database().ref("fcmTokens/" + alert.target).once("value");
    const token = tokenSnap.val();
    if (!token) return null;

    const message = {
      token: token,
      notification: {
        title: "RAMEX Portal",
        body: alert.msg || "Yeni bildirim",
      },
      webpush: {
        notification: {
          icon: "https://mikail96.github.io/ramex-portal/icon-192.png",
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: "https://mikail96.github.io/ramex-portal/",
        },
      },
    };

    try {
      await admin.messaging().send(message);
      console.log("Push sent to", alert.target);
    } catch (err) {
      console.error("Push error:", err.message);
      if (err.code === "messaging/invalid-registration-token" ||
          err.code === "messaging/registration-token-not-registered") {
        await admin.database().ref("fcmTokens/" + alert.target).remove();
      }
    }
    return null;
  }
);
