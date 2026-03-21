/**
 * Google Maps — window.GOOGLE_MAPS_API_KEY (js/runtime-config.js, npm run build + .env)
 */
(function () {
    'use strict';

    function getKey() {
        var k = typeof window.GOOGLE_MAPS_API_KEY === 'string' ? window.GOOGLE_MAPS_API_KEY.trim() : '';
        if (!k || k === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
            console.warn(
                '[Devret Link Maps] GOOGLE_MAPS_API_KEY tanımlı değil. .env + npm run build veya Vercel Environment Variables.'
            );
            return null;
        }
        return k;
    }

    /**
     * @param {{ libraries?: string, callback?: string, language?: string }} options
     */
    window.loadGoogleMaps = function (options) {
        options = options || {};
        var key = getKey();
        if (!key) return;

        if (window.google && window.google.maps) {
            var cb = options.callback && typeof window[options.callback] === 'function' ? window[options.callback] : null;
            if (cb) {
                setTimeout(function () {
                    cb();
                }, 0);
            }
            return;
        }

        if (document.querySelector('script[data-devretin-gmaps="1"]')) {
            return;
        }

        var cbName = options.callback;
        if (cbName && typeof window[cbName] === 'function') {
            var original = window[cbName];
            window[cbName] = function () {
                var ret = original.apply(this, arguments);
                try {
                    window.dispatchEvent(new CustomEvent('googlemapsloaded'));
                } catch (e) { /* ignore */ }
                return ret;
            };
        }

        var params = new URLSearchParams();
        params.set('key', key);
        params.set('language', options.language || 'tr');
        if (options.libraries) params.set('libraries', options.libraries);
        if (cbName) params.set('callback', cbName);

        var s = document.createElement('script');
        s.src = 'https://maps.googleapis.com/maps/api/js?' + params.toString();
        s.async = true;
        s.defer = true;
        s.setAttribute('data-devretin-gmaps', '1');
        document.head.appendChild(s);
    };
})();
