<?php
class UltraDev_SideCart_CartController extends Mage_Core_Controller_Front_Action
{
    protected function _validateFormKey()
    {
        $formKey = $this->getRequest()->getParam('form_key');
        return $formKey && $formKey === Mage::getSingleton('core/session')->getFormKey();
    }

    protected function _sendJson(array $data)
    {
        $this->getResponse()
            ->setHeader('Content-Type', 'application/json', true)
            ->setBody(Mage::helper('core')->jsonEncode($data));
    }

    /**
     * Retorna o payload JSON do carrinho (usado pelo JS ao abrir)
     */
    public function indexAction()
    {
        $this->_sendJson([
            'status'  => 'success',
            'payload' => UltraDev_SideCart_Model_Observer::buildCartPayload(),
        ]);
    }

    /**
     * Atualiza a quantidade de um item
     */
    public function updateItemAction()
    {
        if (!$this->_validateFormKey()) {
            return $this->_sendJson(['status' => 'error', 'message' => $this->__('Invalid form key.')]);
        }

        $itemId = (int) $this->getRequest()->getParam('id');
        $qty    = (int) $this->getRequest()->getParam('qty');

        if (!$itemId || $qty < 1) {
            return $this->_sendJson(['status' => 'error', 'message' => $this->__('Invalid data.')]);
        }

        try {
            $cart  = Mage::getSingleton('checkout/cart');
            $quote = $cart->getQuote();
            $item  = $quote->getItemById($itemId);

            if (!$item) {
                return $this->_sendJson(['status' => 'error', 'message' => $this->__('Item not found.')]);
            }

            $cart->updateItems([$itemId => ['qty' => $qty]])->save();
            $quote->getShippingAddress()->setCollectShippingRates(true);
            $quote->collectTotals()->save();

            $this->_sendJson([
                'status'  => 'success',
                'payload' => UltraDev_SideCart_Model_Observer::buildCartPayload(),
            ]);
        } catch (Exception $e) {
            Mage::logException($e);
            $this->_sendJson(['status' => 'error', 'message' => $this->__('Cannot update cart.')]);
        }
    }

    /**
     * Remove um item do carrinho
     */
    public function removeItemAction()
    {
        if (!$this->_validateFormKey()) {
            return $this->_sendJson(['status' => 'error', 'message' => $this->__('Invalid form key.')]);
        }

        $itemId = (int) $this->getRequest()->getParam('id');

        if (!$itemId) {
            return $this->_sendJson(['status' => 'error', 'message' => $this->__('Invalid item ID.')]);
        }

        try {
            $cart  = Mage::getSingleton('checkout/cart');
            $quote = $cart->getQuote();

            if (!$quote->getItemById($itemId)) {
                return $this->_sendJson(['status' => 'error', 'message' => $this->__('Item not found.')]);
            }

            $cart->removeItem($itemId)->save();
            $quote->getShippingAddress()->setCollectShippingRates(true);
            $quote->collectTotals()->save();
            Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

            $this->_sendJson([
                'status'  => 'success',
                'payload' => UltraDev_SideCart_Model_Observer::buildCartPayload(),
            ]);
        } catch (Exception $e) {
            Mage::logException($e);
            $this->_sendJson(['status' => 'error', 'message' => $this->__('Cannot remove item.')]);
        }
    }

    /**
     * Aplica cupom de desconto
     */
    public function applyCouponAction()
    {
        if (!$this->_validateFormKey()) {
            return $this->_sendJson(['status' => 'error', 'message' => $this->__('Invalid form key.')]);
        }

        $couponCode = trim((string) $this->getRequest()->getParam('coupon_code'));

        if (!$couponCode) {
            return $this->_sendJson(['status' => 'error', 'message' => $this->__('Coupon code is empty.')]);
        }

        try {
            $quote = Mage::getSingleton('checkout/cart')->getQuote();

            if ($quote->getCouponCode() === $couponCode) {
                return $this->_sendJson([
                    'status'  => 'success',
                    'payload' => UltraDev_SideCart_Model_Observer::buildCartPayload(),
                ]);
            }

            $quote->getShippingAddress()->setCollectShippingRates(true);
            $quote->setCouponCode($couponCode)->collectTotals()->save();

            $status  = $quote->getCouponCode() === $couponCode ? 'success' : 'error';
            $message = $status === 'success'
                ? sprintf($this->__('Coupon "%s" applied.'), $couponCode)
                : sprintf($this->__('Coupon "%s" is not valid.'), $couponCode);

            $this->_sendJson([
                'status'  => $status,
                'message' => $message,
                'payload' => UltraDev_SideCart_Model_Observer::buildCartPayload(),
            ]);
        } catch (Exception $e) {
            Mage::logException($e);
            $this->_sendJson(['status' => 'error', 'message' => $this->__('Cannot apply coupon.')]);
        }
    }

    /**
     * Remove cupom de desconto
     */
    public function removeCouponAction()
    {
        if (!$this->_validateFormKey()) {
            return $this->_sendJson(['status' => 'error', 'message' => $this->__('Invalid form key.')]);
        }

        try {
            $quote = Mage::getSingleton('checkout/cart')->getQuote();
            $quote->setCouponCode('')->collectTotals()->save();

            $this->_sendJson([
                'status'  => 'success',
                'payload' => UltraDev_SideCart_Model_Observer::buildCartPayload(),
            ]);
        } catch (Exception $e) {
            Mage::logException($e);
            $this->_sendJson(['status' => 'error', 'message' => $this->__('Cannot remove coupon.')]);
        }
    }
}
