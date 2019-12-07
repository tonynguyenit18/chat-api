const express = require("express");
const router = express.Router();
const User = require("../models/User")
const Message = require("../models/Message")
const S3UploadImage = require("../services/S3UploadImage")

router.post("/login", async (req, res) => {
    const { userName, fcmToken } = req.body;
    if (!userName || !fcmToken) {
        res.status(400).json({ msg: "Missing credentials!" })
        return;
    }

    try {
        let user = await User.findOne({ userName })
        if (!user) {
            const color = getRandomColor();
            const newUser = new User({
                userName,
                fcmToken,
                color
            });
            user = await newUser.save();
        } else {
            user = await User.findOneAndUpdate({ userName }, { fcmToken }, { new: true })
        }
        const messages = await Message.find();
        res.status(200).json({ user, messages, ok: true })

    } catch (err) {
        console.log("Login error: ", err)
    }

})

router.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().populate("user");
        res.status(200).json({ messages })
    } catch (error) {
        res.status(400).json({ msg: "Fetching messages failed!" })
    }
})

router.get("/message/:msgId", async (req, res) => {
    const _id = req.params.msgId;
    try {
        const message = await Message.findById({ _id }).populate("user");
        res.status(200).json({ message })
    } catch (error) {
        res.status(400).json({ msg: "Fetching message failed!" })
    }
})

router.post("/location", async (req, res) => {
    let { location, msgId } = req.body
    console.log(location, msgId, typeof location)
    if (!location || !msgId) return;
    if (location instanceof Object) {
        location = JSON.stringify(location)
    }
    const updatedMsg = await Message.findByIdAndUpdate({ _id: msgId }, { content: location }, { new: true });
    res.status(200).json({ ok: true, updatedMsg })
})

router.post("/image", async (req, res) => {
    console.log("image", req.body)
    const { base64, type, userId, imgType } = req.body;
    if (!base64) return;
    const { Location } = await S3UploadImage.imageUpload(base64, imgType, userId);
    const _id = require("mongoose").Types.ObjectId(userId)
    const user = await User.findOne({ _id });
    const newMessage = new Message({
        content: Location,
        user: _id,
        type
    })

    const addedMsg = await newMessage.save();
    if (addedMsg) {
        res.status(200).json({ ok: true, addedMsg })
    } else {
        res.status(400).json({ ok: false, msg: "Send image failed!" })
    }
    console.log("imgUrl", Location)
})

const getRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},1)`
}

module.exports = router;