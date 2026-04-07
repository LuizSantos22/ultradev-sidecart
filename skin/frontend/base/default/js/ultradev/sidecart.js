/**
 * UltraDev SideCart - JavaScript principal
 * Depende de jQuery já carregado pelo tema (Ultimo)
 */
(function($) {
    if (typeof $ === 'undefined') {
        console.error('UltraDev SideCart: jQuery não encontrado. Verifique se o tema carrega jQuery.');
        return;
    }

    var config = window.UltraDevSideCartConfig || {};
    if (!config.cartUrl) {
        console.error('UltraDev SideCart: Configurações não encontradas.');
        return;
    }

    var UltraDevSideCart = {
        init: function() {
            this.bindCartLink();
            this.bindAddToCart();
        },

        bindCartLink: function() {
            $(config.cartLinkSelector).on('click', function(e) {
                e.preventDefault();
                UltraDevSideCart.open();
            });
        },

        bindAddToCart: function() {
            $(document).on('click', config.addToCartSelector, function(e) {
                var $btn = $(this);
                var $form = $btn.closest('form');
                if ($form.length && $form.attr('id') === 'product_addtocart_form') {
                    e.preventDefault();
                    if (typeof productAddToCartForm !== 'undefined' && productAddToCartForm.validator.validate()) {
                        var formData = $form.serialize();
                        UltraDevSideCart.addToCart($form.attr('action'), formData);
                    }
                    return false;
                }
                var onclick = $btn.attr('onclick');
                if (onclick && onclick.match(/setLocation\('([^']+)'\)/)) {
                    e.preventDefault();
                    var url = RegExp.$1;
                    UltraDevSideCart.addToCartByUrl(url);
                    return false;
                }
            });
        },

        addToCartByUrl: function(url) {
            $.ajax({
                url: url,
                type: 'POST',
                data: { isAjax: 1 },
                dataType: 'json',
                beforeSend: function() {
                    UltraDevSideCart.open(true);
                },
                success: function(resp) {
                    if (resp.status === 'success') {
                        UltraDevSideCart.renderCart(resp.payload);
                    } else {
                        alert(resp.message || 'Error adding to cart');
                    }
                },
                error: function() {
                    alert('Communication error');
                }
            });
        },

        addToCart: function(url, formData) {
            $.ajax({
                url: url,
                type: 'POST',
                data: formData + '&isAjax=1',
                dataType: 'json',
                beforeSend: function() {
                    UltraDevSideCart.open(true);
                },
                success: function(resp) {
                    if (resp.status === 'success') {
                        UltraDevSideCart.renderCart(resp.payload);
                    } else {
                        alert(resp.message || 'Error adding to cart');
                    }
                },
                error: function() {
                    alert('Communication error');
                }
            });
        },

        open: function(loading) {
            $('#ultradev-sidecart').fadeIn(200);
            $('body').addClass('usc-open');
            if (loading) {
                this.loadCartContent();
            }
        },

        close: function() {
            $('#ultradev-sidecart').fadeOut(200);
            $('body').removeClass('usc-open');
        },

        loadCartContent: function() {
            var $container = $('#usc-container');
            $container.html('<div class="usc-loading">Loading...</div>');
            $.ajax({
                url: config.cartUrl,
                type: 'GET',
                dataType: 'json',
                success: function(resp) {
                    if (resp.status === 'success') {
                        UltraDevSideCart.renderCart(resp.payload);
                    } else {
                        $container.html('<div class="usc-error">Error loading cart</div>');
                    }
                },
                error: function() {
                    $container.html('<div class="usc-error">Error loading cart</div>');
                }
            });
        },

        renderCart: function(payload) {
            var $container = $('#usc-container');
            if (!payload.items || payload.items.length === 0) {
                $container.html($('#usc-empty-template').html());
                return;
            }
            var html = this.buildCartHtml(payload);
            $container.html(html);
            this.bindCartEvents();
        },

        buildCartHtml: function(payload) {
            var itemsHtml = '';
            $.each(payload.items, function(i, item) {
                var optionsHtml = '';
                if (item.options && item.options.length) {
                    $.each(item.options, function(j, opt) {
                        optionsHtml += '<span class="usc-option-label">' + UltraDevSideCart.escapeHtml(opt.label) + ':</span> ';
                        optionsHtml += '<span class="usc-option-value">' + UltraDevSideCart.escapeHtml(opt.value) + '</span><br/>';
                    });
                }
                itemsHtml += '<tr class="usc-row" data-item-id="' + item.id + '">' +
                    '<td class="usc-thumb"><img src="' + UltraDevSideCart.escapeHtml(item.thumb) + '" width="75" height="75" alt="' + UltraDevSideCart.escapeHtml(item.name) + '"/></td>' +
                    '<td class="usc-details">' +
                    '<div class="usc-name"><a href="' + UltraDevSideCart.escapeHtml(item.url) + '">' + UltraDevSideCart.escapeHtml(item.name) + '</a></div>' +
                    (optionsHtml ? '<div class="usc-options">' + optionsHtml + '</div>' : '') +
                    '<div class="usc-price">' + item.rowTotal + '</div>' +
                    '</td>' +
                    '<td class="usc-actions">' +
                    '<button class="usc-remove" type="button" data-item-id="' + item.id + '" title="Remove"><i class="bi bi-trash3"></i></button>' +
                    '<div class="usc-qty-wrap">' +
                    '<button class="usc-qty-btn usc-minus" type="button">&#8211;</button>' +
                    '<input class="usc-qty" type="number" value="' + item.qty + '" min="1" data-item-id="' + item.id + '" data-unit-price="' + item.unitPrice + '" />' +
                    '<button class="usc-qty-btn usc-plus" type="button">+</button>' +
                    '</div>' +
                    '</td>' +
                    '</tr>';
            });

            var discountRow = '';
            var finalRow = '';
            if (payload.discountAmount) {
                discountRow = '<div class="usc-total-row usc-discount-row">' +
                    '<span>Discount:</span>' +
                    '<span class="usc-discount-amount">' + payload.discountAmount + '</span>' +
                    '</div>';
                finalRow = '<div class="usc-total-row usc-final-row">' +
                    '<span>Final Total:</span>' +
                    '<span class="usc-final-total">' + payload.grandTotal + '</span>' +
                    '</div>';
            }

            var couponHtml = '';
            if (payload.couponCode) {
                couponHtml = '<div class="usc-coupon-applied">' +
                    '<input type="text" class="usc-coupon-input" value="' + UltraDevSideCart.escapeHtml(payload.couponCode) + '" readonly />' +
                    '<button type="button" class="usc-coupon-remove">Remove</button>' +
                    '</div>';
            } else {
                couponHtml = '<div class="usc-coupon-input-wrap">' +
                    '<input type="text" id="usc-coupon-code" class="usc-coupon-input" placeholder="Enter coupon code" />' +
                    '<button type="button" class="usc-coupon-apply">Apply</button>' +
                    '</div>';
            }

            return '<div class="usc-cart">' +
                '<div class="usc-header">' +
                '<button class="usc-close" id="usc-close" type="button"><i class="bi bi-arrow-right"></i></button>' +
                '<div class="usc-title"><strong>MEU</strong> CARRINHO</div>' +
                '<button class="usc-edit" type="button" onclick="setLocation(\'' + payload.urlCart + '\')"><i class="ic ic-edit2"></i></button>' +
                '</div>' +
                '<div class="usc-items"><table class="usc-table"><tbody>' + itemsHtml + '</tbody></table></div>' +
                '<div class="usc-footer">' +
                '<div class="usc-coupon">' + couponHtml + '<div class="usc-coupon-msg"></div></div>' +
                '<div class="usc-totals">' +
                '<div class="usc-total-row"><span>Total:</span><span class="usc-grand-total">' + payload.subtotal + '</span></div>' +
                discountRow +
                finalRow +
                '</div>' +
                '<button type="button" class="usc-btn-checkout" onclick="setLocation(\'' + payload.urlCheckout + '\')">Finalizar Pedido</button>' +
                '<button type="button" class="usc-btn-continue" id="usc-continue">Continue Shopping</button>' +
                '</div>' +
                '<input type="hidden" id="usc-form-key" value="' + payload.formKey + '" />' +
                '</div>';
        },

        bindCartEvents: function() {
            $('#usc-close, .usc-overlay').off('click').on('click', function() {
                UltraDevSideCart.close();
            });
            $('#usc-continue').off('click').on('click', function() {
                UltraDevSideCart.close();
            });
            $('.usc-plus, .usc-minus').off('click').on('click', function() {
                var $btn = $(this);
                var $input = $btn.siblings('.usc-qty');
                var itemId = $input.data('item-id');
                var qty = parseInt($input.val());
                if ($btn.hasClass('usc-plus')) qty++;
                else if (qty > 1) qty--;
                $input.val(qty);
                UltraDevSideCart.updateItem(itemId, qty);
            });
            $('.usc-qty').off('change').on('change', function() {
                var $input = $(this);
                var itemId = $input.data('item-id');
                var qty = parseInt($input.val());
                if (isNaN(qty) || qty < 1) qty = 1;
                $input.val(qty);
                UltraDevSideCart.updateItem(itemId, qty);
            });
            $('.usc-remove').off('click').on('click', function() {
                var itemId = $(this).data('item-id');
                if (confirm('Remove this item?')) {
                    UltraDevSideCart.removeItem(itemId);
                }
            });
            $('.usc-coupon-apply').off('click').on('click', function() {
                var code = $('#usc-coupon-code').val();
                UltraDevSideCart.applyCoupon(code);
            });
            $('.usc-coupon-remove').off('click').on('click', function() {
                UltraDevSideCart.removeCoupon();
            });
        },

        updateItem: function(itemId, qty) {
            var formKey = $('#usc-form-key').val();
            $.ajax({
                url: config.updateItemUrl,
                type: 'POST',
                data: { id: itemId, qty: qty, form_key: formKey },
                dataType: 'json',
                success: function(resp) {
                    if (resp.status === 'success') {
                        UltraDevSideCart.renderCart(resp.payload);
                    } else {
                        alert(resp.message);
                    }
                }
            });
        },

        removeItem: function(itemId) {
            var formKey = $('#usc-form-key').val();
            $.ajax({
                url: config.removeItemUrl,
                type: 'POST',
                data: { id: itemId, form_key: formKey },
                dataType: 'json',
                success: function(resp) {
                    if (resp.status === 'success') {
                        UltraDevSideCart.renderCart(resp.payload);
                    } else {
                        alert(resp.message);
                    }
                }
            });
        },

        applyCoupon: function(code) {
            var formKey = $('#usc-form-key').val();
            $.ajax({
                url: config.applyCouponUrl,
                type: 'POST',
                data: { coupon_code: code, form_key: formKey },
                dataType: 'json',
                success: function(resp) {
                    if (resp.status === 'success') {
                        UltraDevSideCart.renderCart(resp.payload);
                    } else {
                        $('.usc-coupon-msg').text(resp.message).show().delay(3000).fadeOut();
                    }
                }
            });
        },

        removeCoupon: function() {
            var formKey = $('#usc-form-key').val();
            $.ajax({
                url: config.removeCouponUrl,
                type: 'POST',
                data: { form_key: formKey },
                dataType: 'json',
                success: function(resp) {
                    if (resp.status === 'success') {
                        UltraDevSideCart.renderCart(resp.payload);
                    }
                }
            });
        },

        escapeHtml: function(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }
    };

    $(document).ready(function() {
        UltraDevSideCart.init();
    });

})(jQuery);
