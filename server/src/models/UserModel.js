import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		pic: {
			type: String,
			default:
				"https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg",
		},
	},
	{
		timestamps: true,
	}
);

userSchema.methods.matchPassword = async function (password) {
	console.log(this.password);
	return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
	if (!this.isModified) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
const User = mongoose.model("User", userSchema);

// module.exports = User;
export default User;
