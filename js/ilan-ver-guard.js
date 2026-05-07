/**
 * Giriş yapmamış kullanıcı "İlan Ver" benzeri linklere tıklayınca
 * login.html?portal=...&redirect=... adresine yönlendirir.
 * data-ilan-ver="hedef.html" data-ilan-portal="business|franchise|emlak"
 */
(function () {
    function hasCachedUser() {
        try {
            return !!localStorage.getItem('devredin_user');
        } catch (e) {
            return false;
        }
    }

    function bindGuards() {
        document.querySelectorAll('a[data-ilan-ver]').forEach(function (el) {
            var target = el.getAttribute('data-ilan-ver');
            var portal = el.getAttribute('data-ilan-portal') || 'business';
            if (!target) return;

            var loginUrl =
                'login.html?portal=' +
                encodeURIComponent(portal) +
                '&redirect=' +
                encodeURIComponent(target);

            el.addEventListener('click', function (e) {
                if (hasCachedUser()) return;
                e.preventDefault();
                window.location.href = loginUrl;
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindGuards);
    } else {
        bindGuards();
    }
})();
