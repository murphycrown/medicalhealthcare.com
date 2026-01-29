import { SessionOptions } from "iron-session";

export interface SessionData {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}


export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_PASSWORD!, // 32+ chars
    cookieName: "mediai_session",
    // secure should be true in production
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};
