const firebase = require("firebase-admin");
const serviceAccount = require("../config/chatapp-firebase.json");
const User = require("../models/User")

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://chatapp-37d1c.firebaseio.com"
});
const sendNotiToAll = async (sender, content, senderFcmToken) => {
    const users = await User.find();
    if (!users && users.length == 0) {
        console.log("Get user in notification failed")
        return
    }
    const fcmTokens = users.map(user => user.fcmToken).filter(token => token != senderFcmToken);
    const message = {
        // notification: {
        //     title: `New message from ${sender}`,
        //     body: content
        // },
        data: {
            priority: "high",
            sound: "sound",
            tag: "example",
            icon: "icon",
            title: `New message from ${sender}`,
            body: content,
        },
        tokens: fcmTokens
    }

    firebase.messaging().sendMulticast(message)
        .then(response => {
            console.log("Send noti response: ", response)
        }).catch((error) => {
            console.log('Error sending message:', error);
        });
}

module.exports = {
    sendNotiToAll
}
