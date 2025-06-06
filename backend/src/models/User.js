import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: {
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
        minlength: 6
    },
    bio: {
        type: String,
        default: "",
    },
    profilePic: {
        type: String,
        default: "",
    },
    nativeLanguage: {
        type: String,
        default: "",
    },
    learningLanguage: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    friends: [
       {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
       } 
    ]
},{timestamps: true});  //createdAt, updatedAt

//pre hook
//password hashing - convert passsword to something gibberish
userSchema.pre('save', async function(next){

    if(!this.isModified('password')) return next(); //if password is not modified, skip hashing

    try{
        const salt = await bcrypt.genSalt(10); //10 is the number of rounds
        this.password = await bcrypt.hash(this.password, salt);

        next();

    } catch (error){
        next(error);
    }
})

userSchema.methods.matchPassword = async function(enteredPassword){
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
    return isPasswordCorrect;

}

const User = mongoose.model('User', userSchema);

export default User;


