const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== DATABASE =====
mongoose.connect("mongodb://127.0.0.1:27017/careconnect")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));

// ===== FILE UPLOAD SETUP =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// serve uploaded images
app.use("/uploads", express.static("uploads"));

// ===== MODELS =====
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
  profilePic: String
});

const Request = mongoose.model("Request", {
  name: String,
  phone: String,
  location: String,
  food: String
});

const Donation = mongoose.model("Donation", {
  name: String,
  phone: String,
  foodType: String,
  quantity: String,
  location: String
});

// ===== ROUTES =====

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== FORGOT PASSWORD =====
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// REQUEST
app.post("/api/request", async (req, res) => {
  try {
    console.log("Request:", req.body);
    const data = new Request(req.body);
    await data.save();
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DONATION
app.post("/api/donate", async (req, res) => {
  try {
    console.log("Donation:", req.body);
    const data = new Donation(req.body);
    await data.save();
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ADMIN DASHBOARD
app.get("/api/admin", async (req, res) => {
  try {
    const users = await User.find();
    const requests = await Request.find();
    const donations = await Donation.find();

    res.json({ users, requests, donations });
  } catch (err) {
    res.status(500).json(err);
  }
});

// MATCHING SYSTEM
app.get("/api/match/:location", async (req, res) => {
  try {
    const location = req.params.location;

    const requests = await Request.find({ location });
    const donations = await Donation.find({ location });

    let matches = [];

    requests.forEach(r => {
      donations.forEach(d => {
        if (r.food.toLowerCase() === d.foodType.toLowerCase()) {
          matches.push({ request: r, donation: d });
        }
      });
    });

    res.json(matches);

  } catch (err) {
    res.status(500).json(err);
  }
});

// IMAGE UPLOAD
app.post("/api/uploadProfile/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePic = req.file.filename;
    await user.save();

    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ===== SERVER =====
app.listen(5000, () => {
  console.log("🚀 Server running at http://127.0.0.1:5000");
});
// DELETE DONATION
app.delete("/api/donation/:id", async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: "Donation removed" });
  } catch (err) {
    res.status(500).json(err);
  }
});