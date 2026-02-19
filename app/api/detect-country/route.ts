import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const headerList = await headers();
        // x-forwarded-for can contain a comma-separated list of IPs
        const forwarded = headerList.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : '8.8.8.8'; // Default to a known IP for testing if local

        // Use ipapi.co to get country from IP on the server
        const response = await fetch(`https://ipapi.co/${ip}/json/`);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch geolocation' }, { status: 500 });
        }

        const data = await response.json();

        return NextResponse.json({
            country_code: data.country_code,
            ip: data.ip
        });
    } catch (error) {
        console.error('IP Detection Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
