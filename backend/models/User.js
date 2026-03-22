const mongoose = require("mongoose");

module.exports = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
    role: { type: String, default: "user" }
});