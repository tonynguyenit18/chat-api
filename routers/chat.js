var clients = [];
const User = require("../models/User");
const Message = require("../models/Message");
const firebase = require("../services/FirebaseNotification");

const chat = io => {
    io.on("connection", socket => {
        console.log("A user is connected!")

        socket.on("connect", () => {
            console.log("connected", socket.connected);
        });

        socket.on("newMessage", async data => {
            const { userId, content } = data;
            const _id = require("mongoose").Types.ObjectId(userId)
            const user = await User.findOne({ _id });
            const newMessage = new Message({
                content,
                user: _id
            })

            const addedMsg = await newMessage.save();
            console.log(user);
            firebase.sendNotiToAll(user.userName, content, user.fcmToken)
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