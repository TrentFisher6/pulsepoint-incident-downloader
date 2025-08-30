import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.pulsepoint.org/v1/webapp?resource=agencies');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
} 