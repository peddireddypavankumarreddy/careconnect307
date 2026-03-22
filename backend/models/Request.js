const mongoose = require("mongoose");

module.exports = mongoose.model("Request", {
    name: String,
    phone: String,
    location: String,
    food: String
});