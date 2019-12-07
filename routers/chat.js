var clients = [];
const User = require("../models/User");
const Message = require("../models/Message");
const firebase = require("../services/FirebaseNotification");
const S3UploadImage = require("../services/S3UploadImage")

const chat = io => {
    io.on("connection", socket => {
        console.log("A user is connected!")

        socket.on("connect", () => {
            console.log("connected", socket.connected);
        });

        socket.on("newMessage", async data => {
            let { userId, content, type } = data;
            if (type === "image") {
                const { base64, imgType } = data
                console.log(base64, imgType)
                const { Location } = await S3UploadImage.imageUpload(base64, imgType, userId);
                content = Location
                console.log(content)
            }
            const _id = require("mongoose").Types.ObjectId(userId)
            const user = await User.findOne({ _id });
            const newMessage = new Message({
                content,
                user: _id,
                type
            })

            const addedMsg = await newMessage.save();
            console.log(user);
            firebase.sendNotiToAll(user.userName, content, type, user.fcmToken)
            io.sockets.emit("newMessage", { user, newMessage: addedMsg })
        })

        socket.on("sendLocations", data => {
            console.log("index", "data", data.uuid, data)
        })

        socket.on("disconnect", reason => {
            console.log("disconnected", socket.disconnected, reason);
            clients = clients.filter(client => client.socketID !== socket.id);
        });
    })
};

module.exports = chat;