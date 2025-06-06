import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createDraftTextComposerCompositionMiddleware } from 'stream-chat';

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message: "Unauthorized, No token provided"});
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if(!decode){
            return res.status(401).json({message: "Unauthorized - Invalid token"});
        }

    } catch(error){

    }
}