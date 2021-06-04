<style src="./PageCheckout.scss" lang="scss"></style>
<script src="./PageCheckout.js"></script>
<i18n src="./PageCheckout.txt"></i18n>

<template>
  <span>
    <div v-if="cartExists" class="checkout-main-area pt-130 pb-100">
      <div class="container">
        <!-- <CheckoutTopSection /> -->
        <div class="checkout-wrap">
          <div class="row">
            <div class="col-lg-7">
              <BillingDetails
                :billingAddress="me.activeCart.billingAddress"
                :shippingAddress="me.activeCart.shippingAddress"
                @update-billing-details="updateBilling"
                @update-shipping-details="updateShipping"
                @valid-billing-form="setValidBillingForm"
                @valid-shipping-form="setValidShippingForm"
              />
            </div>
            <div class="col-lg-5">
              <OrderOverview
                @update-shipping="updateShippingMethod"
                @complete-order="placeOrder"
                :showError="showError"
                :me="me"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="orderComplete" class="pt-80 pb-100">
      <div class="container">
        <div class="order-complete text-center">
          <h2>{{ $t('thankYou') }}</h2>
          <router-link class="mt-50" to="/">
            {{ $t('continueShopping') }}
          </router-link>
        </div>
      </div>
    </div>
  </span>
</template>
