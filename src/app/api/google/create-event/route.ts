// src/app/api/google/create-event/route.ts
import { createCalendarEvent, setGoogleCredentials } from '@/lib/google.service';
import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';

export async function POST(req: NextRequest) {
  try {
    const user = await account.get();
    const hasCredentials = await setGoogleCredentials(user.$id);

    if (!hasCredentials) {
      return NextResponse.json({ error: 'User not authenticated with Google' }, { status: 401 });
    }

    const event = await req.json();
    const createdEvent = await createCalendarEvent(event);
    return NextResponse.json(createdEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}