import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface userInterface {
    _id?: mongoose.Types.ObjectId,
    username: string,
    email: string,
    password: string,
    createdAt?: Date,
    updatedAt?: Date
}

const userSchema = new mongoose.Schema<userInterface>(
    {
        username: {
            type: String,
            required: true,
            unique: [true, "Username must be unique"],
            trim: true
        }, 
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

const User = mongoose.models?.User || mongoose.model<userInterface>("User", userSchema)

export default User