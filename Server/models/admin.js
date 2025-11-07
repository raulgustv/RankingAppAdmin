import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcryptjs'


const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'Admin',
        required: true
    }
}, {timestamps: true});

//encrypt pass
adminSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt)
    next();
});

adminSchema.methods.matchPassword = async function (enterPassword){
    return await bcrypt.compare(enterPassword, this.password)
};

const Admin = mongoose.model("Admin", adminSchema)

export default Admin;