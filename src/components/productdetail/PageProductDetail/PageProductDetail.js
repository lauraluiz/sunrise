import Breadcrumb from '../../common/Breadcrumb/Breadcrumb.vue';
import ProductInfo from '../ProductInfo/ProductInfo.vue';
import AddToShoppingList from '../../productoverview/AddToShoppingList/AddToShoppingList.vue';

export default {
  props: {
    productSlug: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    showAddToShoppingList:false,
    productSku: null,
  }),
  methods:{
    openAddToShoppingList() {
      this.showAddToShoppingList = true;
    },
    closeAddToShoppingList() {
      this.showAddToShoppingList = false;
    },
  },
  components: {
    Breadcrumb,
    ProductInfo,
    AddToShoppingList
  },
};
