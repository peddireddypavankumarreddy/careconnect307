const mongoose = require("mongoose");

module.exports = mongoose.model("Donation", {
    name: String,
    phone: String,
    location: String,
    foodType: String,
    quantity: String
});