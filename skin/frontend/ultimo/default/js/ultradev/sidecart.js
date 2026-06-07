/**
 * UltraDev SideCart - Corrected version
 *
 * STRATEGY FOR _bindAddToCart:
 * - DIRECT binding on the button (not delegated on document), same as the original JS.
 * - This prevents window.confirm() from usc-remove from causing a phantom click
 *   that bubbles through the document and fires the add-to-cart handler via delegation.
 * - Category grid support: saves usc-url from .btn-cart with setLocation
 *   and binds a direct handler to each one.
 */
;(function ($) {
    'use strict';

    var cfg  = {};
    var i18n = {};

    var USC = {

        _payload: null,
        _open:    false,
        _loading: false,

        _mp3B64: "data:audio/mp3;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYxLjEuMTAwAAAAAAAAAAAAAAD/+1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAD0AAB/vAAoODhIWFhoaHyMjJycrLy8zMzc7Oz9DQ0dHTFBQVFRYXFxgYGRoaGxwcHR0eX19gYGFiYmNjZGVlZmZnaGhpqqqrq6ytra6ur7CwsbGys7O09fX29vf4+Pn5+vv7/Pz9/v7/wAAAABMYXZjNjEuMy4AAAAAAAAAAAAAAAAkAkAAAAAAAAAf78IwAWwAAAAAAAAAAAAAAAAAAAAA//sgZAAM8LgnJxABFaIAAA0gAAABA5y2pkAo9kAAADSAAAAEBIAI2AAFHBKOuD7JDOBoIZ9g4u3tAAgssAwqNwKAAME/AAfB/+JhjUE/wVBvqCfA9xLH0vru7u4AiFdJKADnIlcIqPb2iwY7u7poWAoFBdkmBSkxgiMtpCLqMYhnuP/7ImQVD/GdLTOAaDNiAAANIAAAAQbUsuoEDTZAAAA0gAAABHuIiIu6Q",

        _svgB64: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMzAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCI+CiAgPGRlZnM+CiAgICA8IS0tIERlZmluacOnw7VlcyBwYXJhIGFuaW1hw6fDtWVzIC0tPgogICAgPGNsaXBQYXRoIGlkPSJjaXJjbGVDbGlwIj4KICAgICAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI4MCI+PC9jaXJjbGU+CiAgICA8L2NsaXBQYXRoPgogICAgCiAgICA8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUFscGhhIiBzdGREZXZpYXRpb249IjMiPjwvZmVHYXVzc2lhbkJsdXI+CiAgICAgIDxmZU9mZnNldCBkeD0iMiIgZHk9IjIiPjwvZmVPZmZzZXQ+CiAgICAgIDxmZUNvbXBvbmVudFRyYW5zZmVyPgogICAgICAgIDxmZUZ1bmNBIHR5cGU9ImxpbmVhciIgc2xvcGU9IjAuMyI+PC9mZUZ1bmNBPgogICAgICA8L2ZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZU1lcmdlPgogICAgICAgIDxmZU1lcmdlTm9kZT48L2ZlTWVyZ2VOb2RlPgogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyI+PC9mZU1lcmdlTm9kZT4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIAogIDxzdHlsZT4KICAgIEBrZXlmcmFtZXMgY2FydE1vdmUgewogICAgICAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjBweCk7IG9wYWNpdHk6IDA7IH0KICAgICAgMTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyBvcGFjaXR5OiAxOyB9CiAgICAgIDQwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgb3BhY2l0eTogMTsgfQogICAgICA4MCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMzAwcHgpOyBvcGFjaXR5OiAwOyB9CiAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMzAwcHgpOyBvcGFjaXR5OiAwOyB9CiAgICB9CiAgICAKICAgIEBrZXlmcmFtZXMgc3BlZWRMaW5lcyB7CiAgICAgIDAlIHsgb3BhY2l0eTogMDsgfQogICAgICAzNSUgeyBvcGFjaXR5OiAwOyB9CiAgICAgIDQ1JSB7IG9wYWNpdHk6IDE7IH0KICAgICAgNzUlIHsgb3BhY2l0eTogMTsgfQogICAgICA4NSUgeyBvcGFjaXR5OiAwOyB9CiAgICAgIDEwMCUgeyBvcGFjaXR5OiAwOyB9CiAgICB9CiAgICAKICAgIEBrZXlmcmFtZXMgY2lyY2xlQ2hhbmdlIHsKICAgICAgMCUsIDc1JSB7IGZpbGw6ICMyYzg1Yzg7IH0gLyogQWx0ZXJhZG8gcGFyYSAjMmM4NWM4ICovCiAgICAgIDg1JSwgMTAwJSB7IGZpbGw6ICMyOGE3NDU7IH0KICAgIH0KICAgIAogICAgQGtleWZyYW1lcyBzcGlubmVyUm90YXRlIHsKICAgICAgMCUgeyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfQogICAgICA2MCUgeyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfQogICAgICA2NSUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfQogICAgICA4NSUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHJvdGF0ZSg3MjBkZWcpOyB9CiAgICAgIDkwJSB7IG9wYWNpdHk6IDA7IHRyYW5zZm9ybTogcm90YXRlKDcyMGRlZyk7IH0KICAgICAgMTAwJSB7IG9wYWNpdHk6IDA7IHRyYW5zZm9ybTogcm90YXRlKDcyMGRlZyk7IH0KICAgIH0KICAgIAogICAgQGtleWZyYW1lcyBjaGVja21hcmtBcHBlYXIgewogICAgICAwJSwgODUlIHsgb3BhY2l0eTogMDsgdHJhbnNmb3JtOiBzY2FsZSgwKTsgfQogICAgICA5MCUgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHNjYWxlKDEuMik7IH0KICAgICAgOTUlIHsgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTsgfQogICAgICAxMDAlIHsgb3BhY2l0eTogMTsgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfQogICAgfQogICAgCiAgICAjYmFja2dyb3VuZENpcmNsZSB7CiAgICAgIGFuaW1hdGlvbjogY2lyY2xlQ2hhbmdlIDAuNTdzIGZvcndhcmRzOwogICAgfQogICAgCiAgICAjY2FydCB7CiAgICAgIGFuaW1hdGlvbjogY2FydE1vdmUgMC41N3MgZm9yd2FyZHM7CiAgICB9CiAgICAKICAgICNzcGVlZExpbmVzIHsKICAgICAgYW5pbWF0aW9uOiBzcGVlZExpbmVzIDAuNTdzIGZvcndhcmRzOwogICAgICBvcGFjaXR5OiAwOwogICAgfQogICAgCiAgICAjc3Bpbm5lciB7CiAgICAgIGFuaW1hdGlvbjogc3Bpbm5lclJvdGF0ZSAwLjU3cyBmb3J3YXJkczsKICAgICAgdHJhbnNmb3JtLW9yaWdpbjogY2VudGVyOwogICAgICBvcGFjaXR5OiAwOwogICAgfQogICAgCiAgICAjY2hlY2ttYXJrIHsKICAgICAgYW5pbWF0aW9uOiBjaGVja21hcmtBcHBlYXIgMC41N3MgZm9yd2FyZHM7CiAgICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlcjsKICAgICAgb3BhY2l0eTogMDsKICAgIH0KICA8L3N0eWxlPgogIAogIDwhLS0gQ8OtcmN1bG8gZGUgZnVuZG8gLS0+CiAgPGNpcmNsZSBpZD0iYmFja2dyb3VuZENpcmNsZSIgY3g9IjIwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiMwZDZlZmQiIGZpbHRlcj0idXJsKCNzaGFkb3cpIj48L2NpcmNsZT4KICAKCiAgCiAgPCEtLSBTcGlubmVyIC0tPgogIDxnIGlkPSJzcGlubmVyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiPgogICAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI0MCIgb3BhY2l0eT0iMC4zIj48L2NpcmNsZT4KICAgIDxwYXRoIGQ9Ik0yMDAgMTEwIEE0MCA0MCAwIDAgMSAyNDAgMTUwIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4KICA8L2c+CiAgCiAgPCEtLSBDYXJyaW5obyBkZSBjb21wcmFzIGNlbnRyYWxpemFkbyAtLT4KICA8ZyBpZD0iY2FydCIgY2xpcC1wYXRoPSJ1cmwoI2NpcmNsZUNsaXApIj4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4OCwgMTQwKSBzY2FsZSgwLjE4KSI+CiAgICAgIDxwYXRoIGZpbGw9IndoaXRlIiBkPSJNMjE4Ljk3LC01OC41NCBDMjEwLjc0LC03Mi44MSAxOTUuNjIsLTgxLjcgMTc5LjE2LC04MS45NiBDMTc5LjE2LC04MS45NiAtMTIwLjU4LC04MS45NiAtMTIwLjU4LC04MS45NiBDLTEyMC41OCwtODEuOTYgLTEzNC4xNywtMTM0Ljg4IC0xMzQuMTcsLTEzNC44OCBDLTEzNi45OSwtMTQ1LjQgLTE0Ni43LC0xNTIuNTkgLTE1Ny41OSwtMTUyLjIxIEMtMTU3LjU5LC0xNTIuMjEgLTIwNC40MiwtMTUyLjIxIC0yMDQuNDIsLTE1Mi4yMSBDLTIxNy4zNSwtMTUyLjIxIC0yMjcuODQsLTE0MS43MyAtMjI3Ljg0LC0xMjguOCBDLTIyNy44NCwtMTE1Ljg2IC0yMTcuMzUsLTEwNS4zOCAtMjA0LjQyLC0xMDUuMzggQy0yMDQuNDIsLTEwNS4zOCAtMTc1LjM4LC0xMDUuMzggLTE3NS4zOCwtMTA1LjM4IEMtMTc1LjM4LC0xMDUuMzggLTExMC43NSwxMzQuODggLTExMC43NSwxMzQuODggQy0xMDcuOTIsMTQ1LjQgLTk4LjIyLDE1Mi41OSAtODcuMzMsMTUyLjIxIEMtODcuMzMsMTUyLjIxIDEyMy40MiwxNTIuMjEgMTIzLjQyLDE1Mi4yMSBDMTMyLjI0LDE1Mi4xOSAxNDAuMywxNDcuMjEgMTQ0LjI2LDEzOS4zMyBDMTQ0LjI2LDEzOS4zMyAyMjEuMDcsLTE0LjI4IDIyMS4wNywtMTQuMjggQzIyNy44NCwtMjguNDYgMjI3LjA0LC00NS4wOCAyMTguOTcsLTU4LjU0eiBNMTA4LjksMTA1LjM4IEMxMDguOSwxMDUuMzggLTY5LjU0LDEwNS4zOCAtNjkuNTQsMTA1LjM4IEMtNjkuNTQsMTA1LjM4IC0xMDcuNzEsLTM1LjEzIC0xMDcuNzEsLTM1LjEzIEMtMTA3LjcxLC0zNS4xMyAxNzkuMTYsLTM1LjEzIDE3OS4xNiwtMzUuMTMgQzE3OS4xNiwtMzUuMTMgMTA4LjksMTA1LjM4IDEwOC45LDEwNS4zOHoiPjwvcGF0aD4KICAgICAgPGNpcmNsZSBmaWxsPSJ3aGl0ZSIgY3g9Ii05OC45MyIgY3k9IjIzNC4xOCIgcj0iMzUuMTMiPjwvY2lyY2xlPgogICAgICA8Y2lyY2xlIGZpbGw9IndoaXRlIiBjeD0iMTM1LjI0IiBjeT0iMjM0LjE3IiByPSIzNS4xMyI+PC9jaXJjbGU+CiAgICA8L2c+CiAgPC9nPgogIAogIDwhLS0gw41jb25lIGRlIGNoZWNrbWFyayAtLT4KICA8ZyBpZD0iY2hlY2ttYXJrIj4KICAgIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTcwIDE0OEwxOTIgMTcwTDIzMiAxMzAiLz4KICA8L2c+Cjwvc3ZnPgo=",

        _playSound: function () {
            try {
                var audio = new Audio(USC._mp3B64);
                audio.play().catch(function (e) {});
            } catch (e) {}
        },

        _showAnimation: function () {
            var existing = document.getElementById('usc-anim-overlay');
            if (existing) existing.parentNode.removeChild(existing);
            var overlay = document.createElement('div');
            overlay.id = 'usc-anim-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);';
            var img = document.createElement('img');
            img.src = 'data:image/svg+xml;base64,' + USC._svgB64;
            img.style.cssText = 'width:200px;height:150px;';
            overlay.appendChild(img);
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

            this._bindOverlayAndPanel();
            this._bindCartIcon();
            this._bindAddToCart();
        },

        open: function () {
            if (this._open) return;
            this._open = true;
            $('body').addClass('usc-open');
        },

        close: function () {
            this._open = false;
            $('body').removeClass('usc-open');
        },

        _bindOverlayAndPanel: function () {
            var self = this;

            $('#usc-overlay').on('click', function () { self.close(); });
            $(document).on('keydown', function (e) {
                if (e.key === 'Escape') self.close();
            });

            $('#usc-panel')
                .off('click').off('usc:update')
                .on('click', '.usc-close, .usc-btn-continue', function () { self.close(); })
                .on('click', '.usc-remove', function () {
                    var $btn = $(this);
                    var itemId = $btn.data('item-id');
                    if (!window.confirm(i18n.confirmRemove || 'Remove this item?')) return;
                    $btn.prop('disabled', true);
                    self._removeItem(itemId, function () {
                        $btn.prop('disabled', false);
                    });
                })
                .on('click', '.usc-minus', function (e) {
                    e.preventDefault();
                    var $input = $(this).siblings('.usc-qty');
                    if ($input.prop('disabled')) return;
                    var val = parseInt($input.val(), 10) || 1;
                    $input.val(Math.max(1, val - 1)).trigger('usc:update');
                })
                .on('click', '.usc-plus', function (e) {
                    e.preventDefault();
                    var $input = $(this).siblings('.usc-qty');
                    if ($input.prop('disabled')) return;
                    var val = parseInt($input.val(), 10) || 1;
                    $input.val(val + 1).trigger('usc:update');
                })
                .on('usc:update', '.usc-qty', function () {
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
                .on('click', '.usc-coupon-apply', function () {
                    var code = $('#usc-panel #usc-coupon-code').val().trim();
                    if (code) USC._applyCoupon(code);
                })
                .on('click', '.usc-coupon-remove', function () {
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

            $wrap.on('mouseenter.usc', function () {
                if ($(window).width() >= 768) {
                    if (self._payload) self.open();
                    else self._loadAndOpen();
                }
            });
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
                            USC._playSound();
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

                // ── PRODUCT PAGE ──────────────────────────────────────────
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

                // ── CATEGORY GRID ─────────────────────────────────────────
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

        _removeItem: function (id, callback) {
            this._post(cfg.removeItemUrl, { id: id }, function (r) {
                if (callback) callback();
                if (!r || !r.payload) {
                    USC._loadAndOpen();
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
            var fk = this._payload ? this._payload.formKey : '';
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
                    + '</tr>';
            });

            var coupon = p.couponCode
                ? '<div class="usc-coupon-applied"><input class="usc-coupon-input" value="' + _esc(p.couponCode) + '" readonly/>'
                  + '<button type="button" class="usc-coupon-remove">' + _esc(i18n.couponRemove) + '</button></div>'
                : '<div class="usc-coupon-input-wrap"><input type="text" id="usc-coupon-code" class="usc-coupon-input" placeholder="' + _esc(i18n.enterCoupon) + '"/>'
                  + '<button type="button" class="usc-coupon-apply">' + _esc(i18n.apply) + '</button></div>';

            var totals      = '';
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

        _updateHeaderQty: function (qty) {
            qty = parseInt(qty, 10) || 0;
            var $heading = $('.mini-cart-heading');
            var $cart    = $('.mini-cart');
            $heading.find('.usc-badge').remove();
            if (qty > 0) {
                $cart.removeClass('is-empty');
                $heading.find('> span').first().append('<span class="usc-badge count">' + qty + '</span>');
            } else {
                $cart.addClass('is-empty');
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
        if ($panel.length)   $('body').append($panel);
        if ($overlay.length) $('body').append($overlay);

        USC.init(window.UltraDevSideCartConfig);
    });
}(jQuery));
