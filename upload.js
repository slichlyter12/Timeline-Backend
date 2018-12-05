const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UploadSchema = new Schema(
	{
		filename: String,
	}, { timestamps: true });

module.exports = mongoose.model("Upload", UploadSchema);