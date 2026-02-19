import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const headerList = await headers();

        // Attempt to get IP from various headers
        let ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headerList.get('x-real-ip') ||
            '';

        console.log(`[IP Detect] Initial IP: "${ip}"`);

        // Handle local IPs (useful for local development)
        if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:')) {
            console.log('[IP Detect] Local IP detected, using 8.8.8.8 for testing');
            ip = '8.8.8.8';
        }

        console.log(`[IP Detect] Fetching for: ${ip}`);

        const response = await fetch(`https://ipapi.co/${ip}/json/`);

        if (!response.ok) {
            console.error(`[IP Detect] ipapi.co fetch failed: ${response.status}`);
            return NextResponse.json({ error: 'Failed to fetch geolocation' }, { status: 500 });
        }

        const data = await response.json();
        console.log('[IP Detect] ipapi.co response:', data);

        if (data.error) {
            console.warn('[IP Detect] ipapi.co error field:', data.reason);
            return NextResponse.json({
                error: data.reason,
                ip: ip,
                status: 'error'
            }, { status: 200 });
        }

        return NextResponse.json({
            country_code: data.country_code,
            ip: data.ip,
            status: 'success'
        });
    } catch (error) {
        console.error('[IP Detect] Fatal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
