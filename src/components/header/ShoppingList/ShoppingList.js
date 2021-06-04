import Vue from 'vue';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { inject, computed,ref } from '@vue/composition-api';
import { SHOPPING_LIST } from '../../../composition/useShoppingList';
// import useLocale from '../../../composition/useLocale';
import ShoppingListProduct from './ShoppingListProduct/ShoppingListProduct.vue'

export default {
  props: {
    shoppingListName: {
      type: String,
      required: true,
    },
  },
  components: {
    VuePerfectScrollbar,
    ShoppingListProduct
  },
  setup(props) {
    const shoppingList = ref(null)
    const {
      getShoppingList, 
      removeLineItem,
      changeQuantity,
      addShoppingListToCart,
      addLineItemToCart:addLineToCart
    } = inject(SHOPPING_LIST);
    getShoppingList({name:props.shoppingListName}).then(
      resolve=>{
        shoppingList.value=resolve
      }
    )
    const items = computed(()=>{
      return (shoppingList.value?.lineItems||[])
    })
    const listNotEmpty = computed(() => {
      return items.value.length > 0
    });
    const removeItem = (itemId) => {
      removeLineItem(
        itemId,
        shoppingList.value.id,
        shoppingList.value.version
      ).then(
        response=>shoppingList.value=response
      )
    }
    const addItemToCart = (lineItem) => {
      addLineToCart(
        lineItem.productId,
        lineItem.quantity,
        lineItem.variantId,
      )
    }
    const amountChange = (quantity,sku,lineItemId)=>{
      changeQuantity(sku,quantity,shoppingList.value.name.en,lineItemId)
    }
    const lineItems = computed(() => {
      return items.value.map(
        item=>({
          ...item,
          name: item.name.en
        })
      )
    });
    return {
      listNotEmpty,
      lineItems,
      removeLineItem,
      removeItem,
      amountChange,
      shoppingList,
      addItemToCart,
      addShoppingListToCart
    };
  },

  computed: {
    show() {
      return this.$store.state.shoppingListOpen;
    },
  },
  watch: {
    show(newValue, oldValue) {
      if (newValue && !oldValue) {
        Vue.nextTick(() => $('.nav-minicart section').scrollTop(0));
      }
    },
  },
};
