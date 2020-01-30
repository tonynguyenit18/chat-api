const firebase = require("firebase-admin");
const serviceAccount = require("../config/chatapp-firebase.json");
const User = require("../models/User")

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://chatapp-37d1c.firebaseio.com"
});
const sendNotiToAll = async (sender, content, type, senderFcmToken) => {
    const users = await User.find();
    if (!users && users.length == 0) {
        console.log("Get user in notification failed")
        return
    }
    const title = type === "text" ? `New message from ${sender}` : type === "location" ? `${sender} share location` : `${sender} share image`;
    content = type === "location" ? `Locate ${sender}` : content
    const fcmTokens = users.filter(user => user.isLoggedIn).map(user => user.fcmToken).filter(token => token != senderFcmToken);
    const message = {
        notification: {
            title: title,
            body: content
        },
        data: {
            priority: "high",
            sound: "sound",
            tag: "example",
            icon: "icon",
            title: `New message from ${sender}`,
            body: content,
        },
        android: {
            notification: {
                sound: "sound",
                tag: "example",
                icon: "icon",
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: "sound",
                    tag: "example",
                    icon: "icon",
                }
            }
        },
        priority: "high",
        tokens: fcmTokens
    }

    firebase.messaging().sendMulticast(message)
        .then(response => {
            console.log("Send noti response: ", response)
            const {responses} = response;
            responses.forEach(res => {
                console.log(res.error)
            });
        }).catch((error) => {
            console.log('Error sending message:', error);
        });
}

module.exports = {
    sendNotiToAll
}
