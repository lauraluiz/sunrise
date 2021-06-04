/**
 * To use this component you need to do the following:
 * set up the api extension for adyen
 * https://github.com/commercetools/commercetools-adyen-integration
 *
 * Set the folling environment variables:
 * VUE_APP_USE_ADYEN=1
 * VUE_APP_ADYEN_CLIENT_KEY=client key (from adyen)
 * VUE_APP_ADYEN_MERCHANT_ACCOUNT=merchant account (from adyenn)
 * VUE_APP_ADYEN_INTEGRATION=key of the extension: https://docs.commercetools.com/api/projects/api-extensions#extension
 * VUE_APP_ADYEN_TYPE=key of the custom type: https://docs.commercetools.com/api/projects/types#type
 *
 * Manage payments scope is needed when creating api key in merchant center
 */

import AdyenCheckout from "@adyen/adyen-web";
import "@adyen/adyen-web/dist/adyen.css";
import payments from "../../../../api/payments";
import { locale } from "../../../common/shared";

const clientKey = process.env.VUE_APP_ADYEN_CLIENT_KEY;
if (!clientKey) {
  throw new Error(
    "Expected VUE_APP_ADYEN_CLIENT_KEY environment value"
  );
}
const amountToAiden = (amount) => ({
  currency: amount.currencyCode,
  value: amount.centAmount, // 100,
});
export default {
  props: { amount: Object },
  data: () => ({
    loading: true,
    paid: false,
    error: false,
  }),
  computed: {
    showComponent() {
      return !this.loading && !this.paid && !this.error;
    },
    showLoading() {
      return this.loading && !this.error;
    },
    showPaid() {
      return this.paid;
    },
    showError() {
      return !this.paid && this.error;
    },
  },
  methods: {
    retry() {
      this.error = false;
      this.onMount();
    },
    createPayment() {
      /** 
       * You have to delete the old payment, updating payment with
       * changeAmountPlanned action when shipping changes doesn't change
       * custom field getPaymentMethodsRequest so the getPaymentMethodsResponse
       * has not been updated as well and may result in invalid values for
       * that
       */
      return Promise.resolve(this.$store.state.payment)
        .then(
          (payment) =>
            payment?.id && payments.deleteItem(payment)
        )
        .then(() =>
          payments
            .createItem({
              amountPlanned: this.amount,
              paymentMethodInfo: {
                paymentInterface:
                  process.env.VUE_APP_ADYEN_INTEGRATION,
                method: "CREDIT_CARD",
                name: {
                  en: "Credit Card",
                },
              },
              custom: {
                type: {
                  typeId: "type",
                  key: process.env.VUE_APP_ADYEN_TYPE,
                },
                fields: {
                  getPaymentMethodsRequest: JSON.stringify({
                    countryCode: "AU",
                    shopperLocale: locale(),
                    amount: amountToAiden(this.amount),
                  }),
                },
              },
            })
            .then((payment) => {
              if (payment.satusCode) {
                return Promise.reject();
              }
              this.$store.dispatch("setPayment", payment);
              return payment;
            })
        );
    },
    onMount() {
      if (this.error) {
        return;
      }
      //@todo: only create a payment item if cart does not have one
      //  emit payment-created and update cart in PageCheckout
      //  pass cart to component and if cart has payment then fetch
      //  it (add fetchitem to payments.js)
      this.createPayment()
        .then((payment) => {
          const configuration = {
            paymentMethodsResponse: JSON.parse(
              payment.custom.fields
                .getPaymentMethodsResponse
            ),
            clientKey,
            locale: locale(this),
            showPayButton: true,
            amount: amountToAiden(this.amount),
            environment: "test",
            onSubmit: (result) => {
              this.loading = true;
              if (!result.isValid) {
                this.error = true;
              }
              payments
                .updateItem({
                  id: payment.id,
                  version: payment.version,
                  amount: amountToAiden(
                    payment.amountPlanned
                  ),
                  paymentMethod: result.data.paymentMethod,
                })
                .then((result) => {
                  if (result.satusCode) {
                    return Promise.reject();
                  }
                  this.loading = false;
                  this.paid = true;
                  this.$emit("card-paid", result.id);
                  this.$store.dispatch(
                    "setPayment",
                    undefined
                  );
                })
                .catch(() => (this.error = true));
            },
          };
          const checkout = new AdyenCheckout(configuration);
          checkout
            .create("card")
            .mount(this.$refs.adyen);
          this.loading = false;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("Error in Adyen", error);
          this.error = true;
        });
    },
  },
  mounted() {
    this.onMount();
  },
};
