const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/careconnect")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

const User = require("./models/User");
const Request = require("./models/Request");
const Donation = require("./models/Donation");

/* REGISTER */
app.post("/api/register", async (req, res) => {
    const { email } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send("User exists");

    const user = await User.create(req.body);
    res.json(user);
});

/* LOGIN */
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).send("User not found");

    if (user.password !== password)
        return res.status(401).send("Wrong password");

    res.json(user);
});

/* CREATE */
app.post("/api/request", async (req, res) => {
    await Request.create(req.body);
    res.send("Request Added");
});

app.post("/api/donation", async (req, res) => {
    await Donation.create(req.body);
    res.send("Donation Added");
});

/* FETCH */
app.get("/api/admin", async (req, res) => {
    const requests = await Request.find().sort({ _id: -1 });
    const donations = await Donation.find().sort({ _id: -1 });
    res.json({ requests, donations });
});

/* DELETE */
app.delete("/api/request/:id", async (req, res) => {
    await Request.findByIdAndDelete(req.params.id);
    res.send("Deleted");
});

app.delete("/api/donation/:id", async (req, res) => {
    await Donation.findByIdAndDelete(req.params.id);
    res.send("Deleted");
});

app.listen(5000, () => console.log("Server running 🚀"));