import Vue from 'vue';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import cartMixin from '../../../mixins/cartMixin';
import productMixin from '../../../mixins/productMixin';
import BasePrice from '../../common/BasePrice/MiniCardBasePrice.vue';
import LineItemInfo from '../../common/CartLike/LineItemInfo/LineItemInfo.vue';
import LineItemDeleteForm from '../../cartdetail/LineItemDeleteForm/LineItemDeleteForm.vue';
import {
  locale, totalPrice, subTotal, variantAttributes,
} from '../../common/shared';

export default {
  components: {
    LineItemDeleteForm,
    LineItemInfo,
    VuePerfectScrollbar,
    BasePrice,
  },
  mixins: [cartMixin, productMixin],
  computed: {
    show() {
      return this.$store.state.miniCartOpen;
    },
    subtotal() {
      return subTotal(this.me.activeCart);
    },
  },
  methods: {
    open() {
      this.$store.dispatch('openMiniCart', 0);
    },
    close() {
      this.$store.dispatch('toggleMiniCart');
    },
    totalPrice,
    nameFromLineItem(lineItem) {
      const attributes = variantAttributes(lineItem?.variant, locale(this));
      return `${lineItem.name} ${attributes.map(
        ({ name, value }) => `${name}: ${value}`,
      ).join(', ')}`;
    },
  },
  watch: {
    show(newValue, oldValue) {
      if (newValue && !oldValue) {
        Vue.nextTick(() => $('.nav-minicart section').scrollTop(0));
      }
    },
    totalItems() {
      this.$store.dispatch('setCartItems', this.totalItems);
    },
  },
};
