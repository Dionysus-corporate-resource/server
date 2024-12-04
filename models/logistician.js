import mongoose from "mongoose";

const LogisticianSchema = new mongoose.Schema(
  {
    userName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    passwordHash: { type: String, require: true },
    phone: { type: String, require: true },
    roles: {
      type: [String],
      enum: ["super_viser", "dispatcher", "manager", "general_director"],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Logistician", LogisticianSchema);
