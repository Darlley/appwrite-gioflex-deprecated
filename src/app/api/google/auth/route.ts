// src/app/api/google/auth/route.ts
import { getGoogleAuthUrl } from '@/lib/google.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const url = getGoogleAuthUrl();
  return NextResponse.redirect(url);
}