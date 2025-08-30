import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agencyId = searchParams.get('agency_id');

  if (!agencyId) {
    return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
  }

  try {
    // Fetch the encrypted data from PulsePoint
    const response = await fetch(`https://api.pulsepoint.org/v1/webapp?resource=incidents&agencyid=${agencyId}`);
    const data = await response.json();
    
    const ct = Buffer.from(data.ct, 'base64');
    const iv = Buffer.from(data.iv, 'hex');
    const salt = Buffer.from(data.s, 'hex');

    // Build the password
    const e = 'CommonIncidents';
    const t = e[13] + e[1] + e[2] + 'brady' + '5' + 'r' + e.toLowerCase()[6] + e[5] + 'gs';

    // Calculate key from password
    let key = Buffer.alloc(0);
    let block: Buffer | null = null;
    let hasher = crypto.createHash('md5');

    while (key.length < 32) {
      if (block) {
        hasher.update(block);
      }
      hasher.update(t);
      hasher.update(salt);
      block = hasher.digest();
      hasher = crypto.createHash('md5');
      key = Buffer.concat([key, block]);
    }

    // Create cipher and decrypt
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let out = Buffer.concat([decipher.update(ct), decipher.final()]);
    out = out.slice(1, out.lastIndexOf('"'));
    const outStr = out.toString().replace(/\\"/g, '"');
    const decryptedData = JSON.parse(outStr);

    return NextResponse.json(decryptedData);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
} 