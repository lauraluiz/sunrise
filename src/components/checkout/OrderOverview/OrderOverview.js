import VuePerfectScrollbar from "vue-perfect-scrollbar";
import ShippingMethod from "../ShippingMethod/ShippingMethod.vue";
import PaymentMethod from "../PaymentMethod/index";
import BasePrice from "../../common/BasePrice/BasePrice.vue";
import productMixin from "../../../mixins/productMixin";
import cartMixin from "../../../mixins/cartMixin";
import CartLikePriceDetail from "../../common/CartLike/CartLikePriceDetail/CartLikePriceDetail.vue";
import LineItemInfo from "../../common/CartLike/LineItemInfo/LineItemInfo.vue";
import {
  totalPrice,
  locale,
  subTotal,
  variantAttributes,
} from "../../common/shared";

export default {
  props: {
    showError: {
      type: Boolean,
      required: false,
    },
  },
  components: {
    LineItemInfo,
    ShippingMethod,
    PaymentMethod,
    CartLikePriceDetail,
    BasePrice,
    VuePerfectScrollbar,
  },
  mixins: [productMixin, cartMixin],
  data: () => ({
    paid: false,
    paymentid: null,
  }),
  methods: {
    cardPaid(paymentid) {
      if (paymentid) {
        this.paymentid = paymentid;
      }
      this.paid = true;
    },
    totalPrice,
    updateShippingMethod(shippingId) {
      this.$emit("update-shipping", shippingId);
      this.$apollo.queries.me.refresh();
    },
    placeOrder() {
      this.$emit("complete-order", this.paymentid);
    },
    nameFromLineItem(lineItem) {
      const attributes = variantAttributes(
        lineItem?.variant,
        locale(this)
      );
      return `${lineItem.name} ${attributes
        .map(({ name, value }) => `${name}: ${value}`)
        .join(", ")}`;
    },
  },
  computed: {
    subtotal() {
      if (this.me) {
        return subTotal(this.me.activeCart);
      }
      return null;
    },
    amount() {
      return this.me.activeCart.totalPrice;
    },
  },
};
