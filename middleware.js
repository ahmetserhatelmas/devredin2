/**
 * Vercel Edge Middleware — yalnızca production'da SITE_MAINTENANCE=1 iken çalışır.
 * Yerel: npx live-server → middleware yok, site normal açılır.
 * Vercel'de kapatmak için: Environment Variables'tan SITE_MAINTENANCE'ı silin veya 0 yapın.
 */

const MAINTENANCE =
    process.env.SITE_MAINTENANCE === '1' ||
    process.env.SITE_MAINTENANCE === 'true' ||
    process.env.SITE_MAINTENANCE === 'yes';

const STATIC_EXT =
    /\.(css|js|mjs|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|txt|xml|json|pdf)$/i;

function allowThrough(pathname) {
    if (pathname === '/maintenance' || pathname === '/maintenance.html') return true;
    if (STATIC_EXT.test(pathname)) return true;
    return false;
}

export default async function middleware(request) {
    if (!MAINTENANCE) {
        return fetch(request);
    }

    const url = new URL(request.url);
    const p = url.pathname;

    if (allowThrough(p)) {
        return fetch(request);
    }

    url.pathname = '/maintenance.html';
    url.search = '';
    url.hash = '';
    return Response.redirect(url.toString(), 307);
}

export const config = {
    matcher: ['/:path*']
};
