import mongoose from "mongoose";

const LogisticianSchema = new mongoose.Schema(
  {
    userName: { type: String, require: false, default: "" },
    email: { type: String, require: true, unique: true },
    passwordHash: { type: String, require: true },
    phone: { type: String, require: true },
    companyPublicData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyPublic",
        require: false
    },
    roles: {
      type: String,
      enum: ["super_viser", "customer", "driver"],
      required: true
    },
  },
  { timestamps: true },
);

export default mongoose.model("Logistician", LogisticianSchema);
