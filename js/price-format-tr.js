/**
 * Türkçe fiyat gösterimi: 95.000, 1.200.000 (binlik ayırıcı nokta)
 * input[data-price-tr] alanlarına otomatik bağlanır (type=text önerilir).
 */
(function (global) {
    function digitsOnly(s) {
        return String(s == null ? '' : s).replace(/\D/g, '');
    }

    function parsePriceTR(value) {
        var d = digitsOnly(value);
        if (!d) return NaN;
        var n = parseInt(d, 10);
        return isFinite(n) ? n : NaN;
    }

    function formatPriceTR(n) {
        if (n === '' || n == null || n === undefined) return '';
        var v = Math.floor(Number(n));
        if (!isFinite(v) || v < 0) return '';
        return v.toLocaleString('tr-TR');
    }

    function hookInput(el) {
        if (!el || el.dataset.priceTrBound === '1') return;
        el.dataset.priceTrBound = '1';
        if (el.type === 'number') el.type = 'text';
        el.setAttribute('inputmode', 'numeric');
        el.setAttribute('autocomplete', 'off');

        function sync() {
            var d = digitsOnly(el.value);
            if (!d) {
                el.value = '';
                return;
            }
            el.value = formatPriceTR(parseInt(d, 10));
        }

        el.addEventListener('input', sync);
        el.addEventListener('blur', sync);
    }

    function bindAll(root) {
        (root || document).querySelectorAll('input[data-price-tr]').forEach(hookInput);
    }

    global.parsePriceTR = parsePriceTR;
    global.formatPriceTR = formatPriceTR;
    global.bindTurkishPriceInputs = bindAll;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            bindAll();
        });
    } else {
        bindAll();
    }
})(typeof window !== 'undefined' ? window : this);
