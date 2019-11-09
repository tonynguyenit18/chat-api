const express = require("express");
const router = express.Router();
const User = require("../models/User")
const Message = require("../models/Message")

router.post("/login", async (req, res) => {
    const { userName, fcmToken } = req.body;
    console.log(req.body)
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
            console.log(user)
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

const getRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},1)`
}

module.exports = router;