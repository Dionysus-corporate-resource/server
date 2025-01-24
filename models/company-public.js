import mongoose from "mongoose"

const CompanyPublicSchema = new mongoose.Schema({
    nameCompany: {type: String, require: true, unique: true },
    subcribeInfo: {type: String, default: "Базовая подписка"}
    // Информация об подписках
    // Массив заявок, созданных логистами одной компании
}, { timestamps: true },)

export default mongoose.model("CompanyPublic", CompanyPublicSchema)
