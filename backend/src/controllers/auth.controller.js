import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export async function signup(req, res) {
    const {email,password,fullName} = req.body;

    try{

        if(!email || !password || !fullName){
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length<6){
            return res.status(400).json({ message: "Password must be atleast 6 characters"});
        }

        const emailReqex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //simple email regex
        if(!emailReqex.test(email)){
            return res.status(400).json({ message: "Invalid email format"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({ message: "Email already exists, please use a different email"});
        }

        const idx = Math.floor(Math.random()*100)+1; //1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`; //random avatar from iran.liara.run

        const newUser = new User.create({
            email,
            fullName,
            password,
            profilePic : randomAvatar,
        });

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d' //token will expire in 30 days
        });

        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days in milliseconds
            httpOnly: true, //cookie is not accessible from client side  (prevents XSS attacks)
            sameSite: 'strict', //cookie is sent only to same site (prevents CSRF attacks)
            secure: process.env.NODE_ENV === 'production' //cookie is sent only over HTTPS in production
        })

        res.status(201).json({success: true, user: newUser})
    } catch (error){

    }
}

export async function login(req, res) {
    res.send('Login Route');
}

export async function logout(req, res) {
    res.send('Logout Route');
}