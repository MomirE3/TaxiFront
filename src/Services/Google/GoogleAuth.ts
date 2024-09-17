import axios from "axios";
import { GoogleUserInfo } from "../../models/Auth/Google/GoogleUserInfo";

async function GetUserInfo(token: string) {
    const GOOGLE_USER_INFO_API = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`;
    
    try {
        const res = await axios.get(GOOGLE_USER_INFO_API, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });
        return res.data as GoogleUserInfo;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export type GoogleAuthServiceType = {
    GetUserInfo: (token: string) => Promise<GoogleUserInfo| null>;
}

export const GoogleAuthService: GoogleAuthServiceType = {
    GetUserInfo
}