import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function fetchFromIpApi(ip: string) {
    console.log(`[IP Detect] Trying ip-api.com for: ${ip}`);
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'success') return null;
    return {
        country_code: data.countryCode,
        ip: data.query
    };
}

async function fetchFromIpapiCo(ip: string) {
    console.log(`[IP Detect] Trying ipapi.co for: ${ip}`);
    const response = await fetch(`https://ipapi.co/${ip}/json/`);

    if (response.status === 429) {
        console.warn(`[IP Detect] ipapi.co rate limit exceeded (429)`);
        return { error: 'rate_limit' };
    }

    if (!response.ok) return null;
    const data = await response.json();
    if (data.error) return { error: data.reason };

    return {
        country_code: data.country_code,
        ip: data.ip
    };
}

export async function GET(request: NextRequest) {
    try {
        const headerList = await headers();

        let ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headerList.get('x-real-ip') ||
            '';

        console.log(`[IP Detect] Incoming IP: "${ip}"`);

        if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:')) {
            console.log('[IP Detect] Local IP, defaulting to 8.8.8.8 for geolocation');
            ip = '8.8.8.8';
        }

        // Try primary provider (ipapi.co)
        let result = await fetchFromIpapiCo(ip);

        // If primary fails or rate limited, try secondary
        if (!result || (result as any).error === 'rate_limit') {
            console.log('[IP Detect] Primary provider failed or rate limited, trying fallback...');
            const fallbackResult = await fetchFromIpApi(ip);
            if (fallbackResult) {
                result = fallbackResult;
            }
        }

        if (result && !(result as any).error) {
            return NextResponse.json({
                ...result,
                status: 'success'
            });
        }

        // Final fallback if all else fails
        console.warn('[IP Detect] All providers failed, returning fallback US');
        return NextResponse.json({
            country_code: 'US',
            ip: ip,
            status: 'fallback',
            message: 'All providers failed or rate limited'
        });

    } catch (error) {
        console.error('[IP Detect] Fatal error:', error);
        return NextResponse.json({
            status: 'error',
            country_code: 'US', // Fallback for stability
            error: 'Internal Server Error'
        }, { status: 200 }); // Still return 200 to let client handle it
    }
}
