import {StreamChat} from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey,apiSecret); 

export const upsertStreamUser = async (userData) => {
    try{
        await streamClient.upsertUsers([userData]); // upsert- create or update
        return userData;
    } catch(error){
        console.error("Errror upserting Stream user",error);
    }
}

export const generateStreamToken = (userid) => {
    
}