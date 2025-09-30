const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    channel: mongoose.Schema.Types.ObjectId,
    subscriber: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = { subscriptionSchema };
