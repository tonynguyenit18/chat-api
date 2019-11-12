const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
var fs = require('fs')
var https = require('https')

const api = require("./routers/api");

const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;
// https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
// }, app).listen(port, () => console.log(`App listening on ${port}...`))

const server = https.Server(app);
const io = require("socket.io")(server);
require("./routers/chat")(io);

server.listen(3000, () => console.log("Socket listening on port 3000..."));

const dbURI = config.get("mongoURI");
mongoose.connect(dbURI).then(() => console.log("MongoDB is connected!"), {
    useNewUrlParser: true,
    dbName: "chatapp"
}).catch(err => console.log(err))

app.listen(port, () => console.log(`App listening on ${port}...`))

app.use("/api", api);