const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
  type: String,
  enum: ["USER", "SYSTEM"],
  default: "USER",
},
action: {
  type: String,
  default: null,
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
