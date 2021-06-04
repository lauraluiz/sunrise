import cartMixin from '../../../mixins/cartMixin';
import { addLine } from '../../common/shared';
// import ServerError from '../../common/form/ServerError/index.vue';
// import LoadingButton from '../../common/form/LoadingButton/index.vue';
// import BaseSelect from '../../common/form/BaseSelect/index.vue';
// import BaseForm from '../../common/form/BaseForm/index.vue';
export const createCartVariables = (component) => ({
  currency: component.$store.state.currency,
  country: component.$store.state.country,
  shippingAddress: { country: component.$store.state.country },
});
export default {
  props: {
    sku: {
      type: String,
      required: true,
    },
    isOnStock: {
      type: Boolean,
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: false,
    },
    onAdd: {
      type: Function|Boolean,
      required:false
    },
    addCaption: {
      type:String,
      default:"addToCart"
    }
  },
  mixins: [cartMixin],
  data: () => ({
    quantity: 1,
    showQuantityError: false,
  }),
  computed: {
    isLoading() {
      return this.$apollo.loading;
    },
    hasStockInfo() {
      return typeof this.availableQuantity !== 'undefined';
    },
  },
  methods: {
    async addLineItem() {
      if(this.onAdd){
        this.onAdd(this.sku,this.quantity)
        return
      }
      if (!this.isOnStock) {
        return;
      }
      if (!this.cartExists) {
        await this.createMyCart(createCartVariables(this));
      }
      //only if hasStockInfo is true, that means stock info is available
      //  if stock info is not available then ignore stock errors
      if (this.quantity <= this.availableQuantity || this.hasStockInfo === false) {
        this.showQuantityError = false;
        return addLine(this)
          .then(() => this.$emit('product-added'))
          .then(() => this.$store.dispatch('openMiniCart'));
      } else {
        this.showQuantityError = true;
      }
    },
  },
};
