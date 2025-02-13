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
      enum: ["in_progress", "pending", "done", "rejected"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Logistician",
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "ProposalsDevelopment",
  ProposalsDevelopmentSchema,
);
