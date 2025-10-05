// src/lib/google.service.ts
import { google } from 'googleapis';
import { account, databases } from './appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID!;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
};

export const setGoogleCredentials = async (userId: string) => {
    const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
  
    if (user.google_access_token && user.google_refresh_token) {
      oauth2Client.setCredentials({
        access_token: user.google_access_token,
        refresh_token: user.google_refresh_token,
        expiry_date: user.google_token_expiry,
      });
      return true;
    }
    return false;
  };

export const createCalendarEvent = async (event: any) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  return response.data;
};

export const getTokensAndStore = async (code: string, userId: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
  
    await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_token_expiry: tokens.expiry_date,
    });
  
    return tokens;
  };