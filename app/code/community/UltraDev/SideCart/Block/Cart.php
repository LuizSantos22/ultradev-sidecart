<?php
class UltraDev_SideCart_Block_Cart extends Mage_Core_Block_Template
{
    public function getItems()
    {
        return Mage::getSingleton('checkout/session')->getQuote()->getAllVisibleItems();
    }

    public function getQuote()
    {
        return Mage::getSingleton('checkout/session')->getQuote();
    }

    public function getDiscountAmount()
    {
        $quote = $this->getQuote();
        return $quote->getSubtotal() - $quote->getSubtotalWithDiscount();
    }

    public function getCouponCode()
    {
        return $this->getQuote()->getCouponCode();
    }

    public function getFormKey()
    {
        return Mage::getSingleton('core/session')->getFormKey();
    }

    public function formatPrice($price)
    {
        return Mage::helper('checkout')->formatPrice($price);
    }

    /**
     * Retorna opções customizadas do produto (atributos configuráveis, opções de produto)
     */
    public function getItemOptions($item)
    {
        $options = [];
        $product = $item->getProduct();
        $typeInstance = $product->getTypeInstance(true);
        $orderOptions = $typeInstance->getOrderOptions($product);

        if (!empty($orderOptions['attributes_info'])) {
            foreach ($orderOptions['attributes_info'] as $opt) {
                $options[] = $opt;
            }
        }
        if (!empty($orderOptions['options'])) {
            foreach ($orderOptions['options'] as $opt) {
                $value = is_array($opt['value']) ? implode(', ', $opt['value']) : $opt['value'];
                $options[] = ['label' => $opt['label'], 'value' => $value];
            }
        }
        return $options;
    }

    public function getItemThumbnailUrl($item)
    {
        try {
            return (string) Mage::helper('catalog/image')
                ->init($item->getProduct(), 'thumbnail')
                ->resize(75, 75);
        } catch (Exception $e) {
            return '';
        }
    }
}
