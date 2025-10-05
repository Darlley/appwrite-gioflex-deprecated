// src/app/api/google/callback/route.ts
import { getTokensAndStore } from '@/lib/google.service';
import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
  }

  try {
    const user = await account.get();
    await getTokensAndStore(code, user.$id);
    return NextResponse.redirect(new URL('/dashboard/pagamentos', req.url));
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json({ error: 'Failed to retrieve tokens' }, { status: 500 });
  }
}