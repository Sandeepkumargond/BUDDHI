import mongoose, { Schema } from "mongoose";

const razorpayCredentialSchema = new Schema(
	{
		admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
			required: true,
			index: true,
			unique: true,
		},
		keyIdEncrypted: {
			type: String,
			default: null,
		},
		keySecretEncrypted: {
			type: String,
			default: null,
		},
		webhookSecretEncrypted: {
			type: String,
			default: null,
		},
		mode: {
			type: String,
			enum: ["test", "live"],
			default: "test",
			lowercase: true,
			trim: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
		},
	},
	{ timestamps: true }
);

export const RazorpayCredential = mongoose.model("RazorpayCredential", razorpayCredentialSchema);





























































































