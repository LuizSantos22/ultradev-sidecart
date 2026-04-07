
<?php
class UltraDev_SideCart_Helper_Data extends Mage_Core_Helper_Abstract
{
    public function isEnabled()
    {
        return (bool) Mage::getStoreConfig('ultradev_sidecart/general/enabled');
    }

    public function getCartSelector()
    {
        $selector = Mage::getStoreConfig('ultradev_sidecart/general/cart_selector');
        return $selector ?: '.top-link-cart';
    }

    public function getAddToCartSelector()
    {
        $selector = Mage::getStoreConfig('ultradev_sidecart/general/addtocart_selector');
        return $selector ?: '.btn-cart, .actions .btn-cart';
    }
}
