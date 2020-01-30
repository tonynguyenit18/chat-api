const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    fcmToken: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    isLoggedIn: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("User", UserSchema);