import ProductList from '../ProductList/ProductList.vue';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb.vue';
import ProductQuickView from '../ProductQuickView/ProductQuickView.vue';
import AddToShoppingList from '../AddToShoppingList/AddToShoppingList.vue';

export default {
  components: {
    ProductList,
    Breadcrumb,
    ProductQuickView,
    AddToShoppingList
  },
  props: {
    categorySlug: String,
    page: {
      type: Number,
      default: 1,
    },
  },
  data: () => ({
    showProductQuickView: false,
    showAddToShoppingList:false,
    productSku: null,
  }),
  methods: {
    openProductQuickView(productInfo) {
      this.showProductQuickView = true;
      this.productSku = productInfo.sku;
    },
    closeProductQuickView() {
      this.showProductQuickView = false;
      this.productSku = null;
    },
    openAddToShoppingList(productInfo) {
      this.showAddToShoppingList = true;
      this.productSku = productInfo.sku;
    },
    closeAddToShoppingList() {
      this.showAddToShoppingList = false;
    },
  },
};
