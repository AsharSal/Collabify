const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",  // Initial empty content
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", // Reference to the User model
    },
    permissions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["viewer", "commentator", "editor"],
          required: true,
        },
      },
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Document Model
const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;
