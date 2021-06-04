import cartMixin from "../../../mixins/cartMixin";
import CheckoutTopSection from "../CheckoutTopSection/CheckoutTopSection.vue";
import OrderOverview from "../OrderOverview/OrderOverview.vue";
import BillingDetails from "../BillingDetails/BillingDetails.vue";

export default {
  components: {
    CheckoutTopSection,
    OrderOverview,
    BillingDetails,
  },
  mixins: [cartMixin],
  data: () => ({
    shippingMethod: null,
    billingAddress: null,
    shippingAddress: null,
    orderComplete: false,
    validBillingForm: false,
    validShippingForm: true,
    showError: false,
  }),
  methods: {
    setValidBillingForm(valid) {
      this.validBillingForm = valid;
    },
    setValidShippingForm(valid) {
      this.validShippingForm = valid;
    },
    updateBilling(billingDetails) {
      this.billingAddress = billingDetails;
    },
    updateShipping(shippingDetails) {
      this.shippingAddress = shippingDetails;
    },
    updateShippingMethod(shippingId) {
      this.shippingMethod = shippingId;
    },
    placeOrder(paymentid) {
      if (this.validBillingForm && this.validShippingForm) {
        this.updateMyCart([
          {
            setBillingAddress: {
              address: this.billingAddress,
            },
          },
        ])
          .then((result) => {
            this.me.activeCart = result.data.updateMyCart;
            if (!this.shippingAddress) {
              return this.updateMyCart([
                {
                  setShippingAddress: {
                    address: this.billingAddress,
                  },
                },
              ]);
            }
            return this.updateMyCart([
              {
                setShippingAddress: {
                  address: this.shippingAddress,
                },
              },
            ]);
          })
          .then((result) => {
            if (paymentid) {
              return this.updateMyCart([
                {
                  addPayment: {
                    payment: {
                      id: paymentid,
                    },
                  },
                },
              ]);
            }
            return result;
          })
          .then((result) => {
            this.me.activeCart = result.data.updateMyCart;
            return this.createMyOrder();
          })
          .then(() => {
            this.orderComplete = true;
          });
      } else {
        this.showError = true;
      }
    },
  },
};
