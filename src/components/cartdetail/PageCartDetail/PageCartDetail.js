import cartMixin from '../../../mixins/cartMixin';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner.vue';
import CartLikeContentDetail from '../../common/CartLike/CartLikeContentDetail/CartLikeContentDetail.vue';
import CartLikePriceDetail from '../../common/CartLike/CartLikePriceDetail/CartLikePriceDetail.vue';
import AddDiscountCodeForm from '../AddDiscountCodeForm/AddDiscountCodeForm.vue';

export default {
  components: {
    LoadingSpinner,
    CartLikeContentDetail,
    CartLikePriceDetail,
    AddDiscountCodeForm,
  },
  computed: {
    isLoading() {
      return !this.me
    },
  },
  mixins: [cartMixin],
};
