const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    foodType: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Donation", donationSchema);