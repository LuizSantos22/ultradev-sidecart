/**
 * UltraDev SideCart – Versão estável (layout original, som simples, remoção 1 clique)
 */
;(function ($) {
    'use strict';

    var cfg  = {};
    var i18n = {};

    var USC = {

        _payload: null,
        _open:    false,
        _loading: false,

        // SVG da animação (original, sem alterações)
        _svgMarkup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">'
            + '<defs>'
            + '<clipPath id="circleClip"><circle cx="200" cy="150" r="80"></circle></clipPath>'
            + '<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">'
            + '<feGaussianBlur in="SourceAlpha" stdDeviation="3"></feGaussianBlur>'
            + '<feOffset dx="2" dy="2"></feOffset>'
            + '<feComponentTransfer><feFuncA type="linear" slope="0.3"></feFuncA></feComponentTransfer>'
            + '<feMerge><feMergeNode></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>'
            + '</filter>'
            + '</defs>'
            + '<style>'
            + '@keyframes cartMove {'
            + '0%{transform:translateX(-20px);opacity:0}'
            + '10%{transform:translateX(0);opacity:1}'
            + '40%{transform:translateX(0);opacity:1}'
            + '80%{transform:translateX(300px);opacity:0}'
            + '100%{transform:translateX(300px);opacity:0}}'
            + '@keyframes circleChange {'
            + '0%,75%{fill:#2c85c8}'
            + '85%,100%{fill:#28a745}}'
            + '@keyframes spinnerRotate {'
            + '0%{opacity:0;transform:rotate(0deg)}'
            + '60%{opacity:0;transform:rotate(0deg)}'
            + '65%{opacity:1;transform:rotate(0deg)}'
            + '85%{opacity:1;transform:rotate(720deg)}'
            + '90%{opacity:0;transform:rotate(720deg)}'
            + '100%{opacity:0;transform:rotate(720deg)}}'
            + '@keyframes checkmarkAppear {'
            + '0%,85%{opacity:0;transform:scale(0)}'
            + '90%{opacity:1;transform:scale(1.2)}'
            + '95%{transform:scale(0.95)}'
            + '100%{opacity:1;transform:scale(1)}}'
            + '#usc-svg-bg{animation:circleChange 0.57s forwards}'
            + '#usc-svg-cart{animation:cartMove 0.57s forwards}'
            + '#usc-svg-spinner{animation:spinnerRotate 0.57s forwards;transform-origin:200px 150px;opacity:0}'
            + '#usc-svg-checkmark{animation:checkmarkAppear 0.57s forwards;transform-origin:200px 150px;opacity:0}'
            + '</style>'
            + '<circle id="usc-svg-bg" cx="200" cy="150" r="80" fill="#2c85c8" filter="url(#shadow)"></circle>'
            + '<g id="usc-svg-spinner" stroke="white" stroke-width="8" fill="none">'
            + '<circle cx="200" cy="150" r="40" opacity="0.3"></circle>'
            + '<path d="M200 110 A40 40 0 0 1 240 150" stroke-linecap="round"></path>'
            + '</g>'
            + '<g id="usc-svg-cart" clip-path="url(#circleClip)">'
            + '<g transform="translate(188,140) scale(0.18)">'
            + '<path fill="white" d="M218.97,-58.54 C210.74,-72.81 195.62,-81.7 179.16,-81.96 C179.16,-81.96 -120.58,-81.96 -120.58,-81.96 C-120.58,-81.96 -134.17,-134.88 -134.17,-134.88 C-136.99,-145.4 -146.7,-152.59 -157.59,-152.21 C-157.59,-152.21 -204.42,-152.21 -204.42,-152.21 C-217.35,-152.21 -227.84,-141.73 -227.84,-128.8 C-227.84,-115.86 -217.35,-105.38 -204.42,-105.38 C-204.42,-105.38 -175.38,-105.38 -175.38,-105.38 C-175.38,-105.38 -110.75,134.88 -110.75,134.88 C-107.92,145.4 -98.22,152.59 -87.33,152.21 C-87.33,152.21 123.42,152.21 123.42,152.21 C132.24,152.19 140.3,147.21 144.26,139.33 C144.26,139.33 221.07,-14.28 221.07,-14.28 C227.84,-28.46 227.04,-45.08 218.97,-58.54z M108.9,105.38 C108.9,105.38 -69.54,105.38 -69.54,105.38 C-69.54,105.38 -107.71,-35.13 -107.71,-35.13 C-107.71,-35.13 179.16,-35.13 179.16,-35.13 C179.16,-35.13 108.9,105.38 108.9,105.38z"></path>'
            + '<circle fill="white" cx="-98.93" cy="234.18" r="35.13"></circle>'
            + '<circle fill="white" cx="135.24" cy="234.17" r="35.13"></circle>'
            + '</g></g>'
            + '<g id="usc-svg-checkmark">'
            + '<path fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" d="M170 148L192 170L232 130"/>'
            + '</g>'
            + '</svg>',

        // Som simples (sine wave, volume 0.5) – sem MP3, sem glockenspiel
        _playSound: function () {
            try {
                var AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                var ctx = new AudioCtx();
                if (ctx.state === 'suspended') ctx.resume();
                var now = ctx.currentTime;
                function note(freq, start, gain, decay) {
                    var g = ctx.createGain();
                    g.gain.setValueAtTime(0, now + start);
                    g.gain.linearRampToValueAtTime(gain, now + start + 0.003);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + start + decay);
                    g.connect(ctx.destination);
                    var o = ctx.createOscillator();
                    o.type = 'sine';
                    o.frequency.value = freq;
                    o.connect(g);
                    o.start(now + start);
                    o.stop(now + start + decay + 0.05);
                }
                note(1175, 0,    0.30, 0.13);
                note(2360, 0.13, 0.35, 0.65);
            } catch (e) {}
        },

        _showAnimation: function () {
            var existing = document.getElementById('usc-anim-overlay');
            if (existing) existing.parentNode.removeChild(existing);
            var overlay = document.createElement('div');
            overlay.id = 'usc-anim-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;pointer-events:none;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);isolation:isolate;';
            overlay.innerHTML = this._svgMarkup;
            document.body.appendChild(overlay);
            setTimeout(function () {
                overlay.style.transition = 'opacity 0.3s';
                overlay.style.opacity = '0';
                setTimeout(function () {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 300);
            }, 900);
        },

        init: function (config) {
            cfg  = config || {};
            i18n = cfg.i18n || {};
            $(document).off('click.skip', '#usc-panel');
            $('#usc-panel').off('click');
            this._bindOverlayAndPanel();
            this._bindCartIcon();
            this._bindAddToCart();
        },

        open: function () {
            this._open = true;
            $('body').addClass('usc-open');
            $('#header-cart').removeClass('skip-active');
            $('.skip-cart').removeClass('skip-active');
            $('.skip-link, .skip-cart').addClass('usc-skip-disabled');
        },

        close: function () {
            this._open = false;
            $('body').removeClass('usc-open');
            $('.skip-link, .skip-cart').removeClass('usc-skip-disabled');
        },

        _bindOverlayAndPanel: function () {
            var self = this;
            $('#usc-overlay').on('click', function () { self.close(); });
            $(document).on('keydown', function (e) {
                if (e.key === 'Escape') self.close();
            });
            $(document)
                .off('click.usc-panel').off('usc:update.usc-panel')
                .on('click.usc-panel', '#usc-panel .usc-close, #usc-panel .usc-btn-continue', function () { self.close(); })
                .on('click.usc-panel', '#usc-panel .usc-remove', function (e) {
                    e.stopPropagation();
                    var $btn = $(this);
                    if ($btn.data('usc-removing')) return;
                    var itemId = $btn.data('item-id');
                    $btn.data('usc-removing', true);
                    $btn.closest('tr.usc-row').css({ opacity: '0.4', pointerEvents: 'none' });
                    self._removeItem(itemId);
                })
                .on('click.usc-panel', '#usc-panel .usc-minus', function (e) {
                    e.preventDefault();
                    var $input = $(this).siblings('.usc-qty');
                    if ($input.prop('disabled')) return;
                    var val = parseInt($input.val(), 10) || 1;
                    $input.val(Math.max(1, val - 1)).trigger('usc:update.usc-panel');
                })
                .on('click.usc-panel', '#usc-panel .usc-plus', function (e) {
                    e.preventDefault();
                    var $input = $(this).siblings('.usc-qty');
                    if ($input.prop('disabled')) return;
                    var val = parseInt($input.val(), 10) || 1;
                    $input.val(val + 1).trigger('usc:update.usc-panel');
                })
                .on('usc:update.usc-panel', '#usc-panel .usc-qty', function () {
                    var $input = $(this);
                    if ($input.data('updating')) return;
                    $input.data('updating', true);
                    var itemId = $input.data('item-id');
                    var qty = Math.max(1, parseInt($input.val(), 10) || 1);
                    $input.prop('disabled', true);
                    $input.siblings('.usc-minus, .usc-plus').prop('disabled', true);
                    USC._updateItem(itemId, qty, function () {
                        $input.prop('disabled', false);
                        $input.siblings('.usc-minus, .usc-plus').prop('disabled', false);
                        $input.data('updating', false);
                    });
                })
                .on('click.usc-panel', '#usc-panel .usc-coupon-apply', function () {
                    var code = $('#usc-panel #usc-coupon-code').val().trim();
                    if (code) USC._applyCoupon(code);
                })
                .on('click.usc-panel', '#usc-panel .usc-coupon-remove', function () {
                    USC._removeCoupon();
                });
        },

        _bindCartIcon: function () {
            var self = this;
            var $wrap = $('.skip-cart, #header-cart').first();
            var $link = $wrap.find('a').first();
            if (!$link.length) {
                $link = $(cfg.cartLinkSelector || '.top-link-cart').first();
                $wrap = $link.parent();
            }
            $link.on('click.usc', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (self._payload) self.open();
                else self._loadAndOpen();
            });
        },

        _bindAddToCart: function () {
            var self = this;

            function ajaxAddToCart(data, $btn) {
                $.ajax({
                    url:     cfg.addToCartUrl,
                    type:    'POST',
                    data:    $.extend({}, data, { isAjax: 1 }),
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    success: function (r) {
                        if ($btn) $btn.data('usc-working', false);
                        if (r && r.status === 'success' && r.payload) {
                            USC._showAnimation();
                            self._payload = r.payload;
                            self._render(r.payload);
                            self._updateHeaderQty(r.payload.qty);
                            self.open();
                        } else {
                            alert(r.message || 'Error adding product');
                        }
                    },
                    error: function (xhr, status, error) {
                        if ($btn) $btn.data('usc-working', false);
                        console.error('UltraDev SideCart: AJAX error', status, error);
                        alert('Server communication error.');
                    }
                });
            }

            $(document).ready(function () {
                var $productBtn = $('#product-addtocart-button');
                if ($productBtn.length) {
                    $productBtn[0].onclick = null;
                    $productBtn.removeAttr('onclick');
                    $productBtn.on('click.usc', function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        var $btn = $(this);
                        if ($btn.data('usc-working')) return false;
                        setTimeout(function() { USC._playSound(); }, 900);
                        $btn.data('usc-working', true);
                        if (typeof productAddToCartForm !== 'undefined' &&
                            productAddToCartForm.validator &&
                            !productAddToCartForm.validator.validate()) {
                            $btn.data('usc-working', false);
                            return false;
                        }
                        var $form = $btn.closest('form');
                        if (!$form.length) {
                            $btn.data('usc-working', false);
                            return false;
                        }
                        var formData = {};
                        $.each($form.serializeArray(), function (_, f) {
                            formData[f.name] = f.value;
                        });
                        ajaxAddToCart(formData, $btn);
                        return false;
                    });
                }

                $('.btn-cart').each(function () {
                    var $btn = $(this);
                    if ($btn.data('usc-bound')) return;
                    $btn.data('usc-bound', true);
                    if ($btn.is('a') && !$btn.attr('onclick')) return;
                    var onclick = $btn.attr('onclick') || '';
                    var match   = onclick.match(/setLocation\(['"]([^'"]+)['"]\)/);
                    if (!match) return;
                    var uscUrl = match[1];
                    $btn[0].onclick = null;
                    $btn.removeAttr('onclick');
                    $btn.data('usc-url', uscUrl);
                    $btn.on('click.usc', function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        if ($btn.data('usc-working')) return false;
                        setTimeout(function() { USC._playSound(); }, 900);
                        $btn.data('usc-working', true);
                        var url          = $btn.data('usc-url') || '';
                        var productMatch = url.match(/\/product\/(\d+)/);
                        var formKeyMatch = url.match(/\/form_key\/([^\/]+)/);
                        if (!productMatch) {
                            $btn.data('usc-working', false);
                            return false;
                        }
                        ajaxAddToCart({
                            product:  productMatch[1],
                            qty:      1,
                            form_key: formKeyMatch ? formKeyMatch[1] : ''
                        }, $btn);
                        return false;
                    });
                });
            });
        },

        _loadAndOpen: function () {
            var self = this;
            if (this._payload) { this.open(); return; }
            if (this._loading) return;
            this._loading = true;
            $.ajax({
                url:     cfg.cartUrl,
                type:    'GET',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                success: function (r) {
                    if (r && r.payload) {
                        self._payload = r.payload;
                        self._render(r.payload);
                        self._updateHeaderQty(r.payload.qty);
                    } else {
                        self._render({ items: [] });
                    }
                    self.open();
                },
                complete: function () { self._loading = false; }
            });
        },

        _updateItem: function (id, qty, callback) {
            this._post(cfg.updateItemUrl, { id: id, qty: qty }, callback);
        },

        _removeItem: function (id) {
            var self = this;
            this._post(cfg.removeItemUrl, { id: id }, function (r) {
                if (!r || !r.payload) {
                    self._loadAndOpen();
                } else if (!r.payload.items || r.payload.items.length === 0) {
                    // Carrinho ficou vazio — força limpeza do counter
                    self._updateHeaderQty(0);
                }
            });
        },

        _applyCoupon: function (code) {
            this._post(cfg.applyCouponUrl, { coupon_code: code }, function (r) {
                if (r && r.message) {
                    $('#usc-panel .usc-coupon-msg')
                        .text(r.message)
                        .removeClass('usc-msg--error usc-msg--success')
                        .addClass(r.status === 'error' ? 'usc-msg--error' : 'usc-msg--success');
                }
            });
        },

        _removeCoupon: function () {
            this._post(cfg.removeCouponUrl, {});
        },

        _post: function (url, data, extraCb) {
            var self = this;
            var fk = (this._payload && this._payload.formKey) ? this._payload.formKey : '';
            if (!fk) {
                fk = $('input[name="form_key"]').first().val() || '';
            }
            data.form_key = fk;
            $.ajax({
                url:     url,
                type:    'POST',
                data:    data,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                success: function (r) {
                    if (r && r.payload) {
                        self._payload = r.payload;
                        self._render(r.payload);
                        self._updateHeaderQty(r.payload.qty);
                    } else if (r && r.status === 'success') {
                        self._loadAndOpen();
                    } else {
                        console.warn('Unexpected response:', r);
                    }
                    if (extraCb) extraCb(r);
                },
                error: function () { if (extraCb) extraCb(null); }
            });
        },

        _render: function (p) {
            var html = (p.items && p.items.length > 0) ? this._htmlFull(p) : this._htmlEmpty();
            $('#usc-panel-inner').html(html);
        },

        _htmlEmpty: function () {
            return '<div class="usc-cart usc-cart--empty" style="height:100%;display:flex;flex-direction:column;">'
                + '<div class="usc-header">'
                + '<button class="usc-close" type="button" aria-label="' + _esc(i18n.close) + '"><i class="bi bi-arrow-right"></i></button>'
                + '<div class="usc-title"><strong>' + _esc(i18n.myCart) + '</strong> ' + _esc(i18n.cart) + '</div>'
                + '<span></span></div>'
                + '<div class="usc-empty-msg"><p>' + _esc(i18n.empty) + '</p>'
                + '<button class="usc-btn-continue" type="button">' + _esc(i18n.continueShopping) + '</button></div>'
                + '</div>';
        },

        _htmlFull: function (p) {
            var rows = '';
            $.each(p.items, function (i, item) {
                var thumb = item.thumb ? '<img src="' + _esc(item.thumb) + '" alt="' + _esc(item.name) + '" width="75" height="75"/>' : '';
                var name  = item.url ? '<a href="' + _esc(item.url) + '">' + _esc(item.name) + '</a>' : _esc(item.name);
                var opts  = '';
                if (item.options && item.options.length) {
                    opts = '<div class="usc-options">';
                    $.each(item.options, function (j, o) {
                        opts += '<span class="usc-option-label">' + _esc(o.label) + ':</span> '
                             + '<span class="usc-option-value">'  + _esc(o.value) + '</span> ';
                    });
                    opts += '</div>';
                }
                rows += '<tr class="usc-row" data-item-id="' + item.id + '">'
                    + '<td class="usc-thumb">' + thumb + '</td>'
                    + '<td class="usc-details"><div class="usc-name">' + name + '</div>' + opts
                    + '<div class="usc-price">' + item.rowTotal + '</div>'
                    + '</td>'
                    + '<td class="usc-actions">'
                    + '<button class="usc-remove" type="button" data-item-id="' + item.id + '" title="' + _esc(i18n.remove) + '"><i class="bi bi-trash3"></i></button>'
                    + '<div class="usc-qty-wrap">'
                    + '<button class="usc-qty-btn usc-minus" type="button">&#8211;</button>'
                    + '<input class="usc-qty" type="number" value="' + item.qty + '" min="1" data-item-id="' + item.id + '"/>'
                    + '<button class="usc-qty-btn usc-plus" type="button">+</button>'
                    + '</div>'
                    + '</td>'
                    + '<tr>';
            });

            var coupon = p.couponCode
                ? '<div class="usc-coupon-applied"><input class="usc-coupon-input" value="' + _esc(p.couponCode) + '" readonly/>'
                  + '<button type="button" class="usc-coupon-remove">' + _esc(i18n.couponRemove) + '</button></div>'
                : '<div class="usc-coupon-input-wrap"><input type="text" id="usc-coupon-code" class="usc-coupon-input" placeholder="' + _esc(i18n.enterCoupon) + '"/>'
                  + '<button type="button" class="usc-coupon-apply">' + _esc(i18n.apply) + '</button></div>';

            var totals = '';
            var hasDiscount = !!p.discountAmount;
            if (hasDiscount) {
                totals += '<div class="usc-total-row usc-is-subtotal"><span>Subtotal</span><span class="usc-grand-total">' + p.subtotal + '</span></div>';
                totals += '<div class="usc-total-row usc-discount-row"><span>' + _esc(i18n.discount) + '</span><span class="usc-discount-amount">' + p.discountAmount + '</span></div>';
                totals += '<div class="usc-total-row usc-final-row usc-is-final"><span>Final Value</span><span class="usc-final-total">' + p.grandTotal + '</span></div>';
            } else {
                totals += '<div class="usc-total-row"><span>' + _esc(i18n.total) + '</span><span class="usc-grand-total">' + p.grandTotal + '</span></div>';
            }

            return '<div class="usc-cart">'
                + '<div class="usc-header">'
                + '<button class="usc-close" type="button" aria-label="' + _esc(i18n.close) + '"><i class="bi bi-arrow-right"></i></button>'
                + '<div class="usc-title"><strong>' + _esc(i18n.myCart) + '</strong> ' + _esc(i18n.cart) + '</div>'
                + '<button class="usc-edit" type="button" onclick="setLocation(\'' + p.urlCart + '\')" aria-label="Edit"><i class="ic ic-edit2"></i></button>'
                + '</div>'
                + '<div class="usc-items"><table class="usc-table"><tbody>' + rows + '</tbody></table></div>'
                + '<div class="usc-footer">'
                + '<div class="usc-coupon">' + coupon + '<div class="usc-coupon-msg"></div></div>'
                + '<div class="usc-totals">' + totals + '</div>'
                + '<button type="button" class="usc-btn-checkout" onclick="setLocation(\'' + p.urlCheckout + '\')">' + _esc(i18n.checkout) + '</button>'
                + '<button type="button" class="usc-btn-continue">' + _esc(i18n.continueShopping) + '</button>'
                + '</div></div>';
        },

        // CORREÇÃO: remove badge nativo do Ultimo além do usc-badge
        _updateHeaderQty: function (qty) {
            qty = parseInt(qty, 10) || 0;
            var $heading = $('.mini-cart-heading');
            var $cart    = $('.mini-cart');
            $heading.find('.usc-badge, .count').remove();
            if (qty > 0) {
                $cart.removeClass('is-empty');
                $heading.find('> span').first().append('<span class="usc-badge count">' + qty + '</span>');
            } else {
                $cart.addClass('is-empty');
                $('.mini-cart .count, .mini-cart .usc-badge').remove();
            }
        }
    };

    function _esc(str) {
        return $('<div>').text(str || '').html();
    }

    $(document).ready(function () {
        if (!window.UltraDevSideCartConfig || !window.UltraDevSideCartConfig.cartUrl) return;
        var $panel   = $('#usc-panel');
        var $overlay = $('#usc-overlay');
        if ($overlay.length) $('body').append($overlay);
        if ($panel.length)   $('body').append($panel);
        USC.init(window.UltraDevSideCartConfig);
    });
}(jQuery));
