import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    passwordHash: { type: String, require: true },
    roles: {
      type: [String],
      enum: ["super-viser", "dispatcher", "manager"],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
