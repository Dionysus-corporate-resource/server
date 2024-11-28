import mongoose from "mongoose";

const ProposalsDevelopmentSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    description: { type: String },
    topic: {
      type: String,
      require: true,
      enum: ["bag", "proposals"],
    },
    status: {
      type: String,
      require: true,
      enum: ["in_progress", "pending", "done"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "ProposalsDevelopment",
  ProposalsDevelopmentSchema,
);
