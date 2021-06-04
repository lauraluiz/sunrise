import {
  onMounted,
  ref,
  watch,
} from "@vue/composition-api";
import shoppingListApi from "../api/shoppingList";
import cartApi from "../api/cart";
import { selectAuth, selectCurrency } from "./selectors";
import useCountry from "./useCountry";
import useStore from "./useStore";

export default (props,ctx,cart) => {
  const auth = useStore(ctx,selectAuth)
  const requested = { current: null };
  const shoppingLists = ref(undefined);
  const country = useCountry();
  const currency = useStore(ctx, selectCurrency);

  const getShoppingList = (query) => {
    const current = {};
    requested.current = current;
    return shoppingListApi.get(query).then((response) => {
      if (requested.current === current && !query) {
        shoppingLists.value = response.results;
        return
      }
      return response.results[0]
    });
  };
  const refreshList = ()=>{
    shoppingListApi.resetCache()
    return getShoppingList()
  }
  const getCreateChange = (name,callback) => {
    return shoppingListApi.get({name}).then(
      result=>{
        if(result.total===0){
          return shoppingListApi.create({name})
        }
        return result.results[0]
      }
    ).then(callback).finally(refreshList)
  };  const changeQuantity = (sku,quantity,name,lineItemId) => {
    return getCreateChange(
      name,
      (result)=>{
        return shoppingListApi.setQuantity([
          sku, Number(quantity), result.id, result.version,lineItemId
        ])
      }
    );
  };
  const addToShoppingList = (sku,quantity,name) => {
    return getCreateChange(
      name,
      result=>{
        return shoppingListApi.addItem([
          sku, Number(quantity), result.id, result.version
        ])
      }
    )
  };
  const removeLineItem = (
    itemId,
    listId,
    version
  ) => {
    return shoppingListApi.removeItem([
        itemId,
        listId,
        version,
      ]).finally(refreshList)
  };
  const removeList = (list) => {
    shoppingListApi.remove(list).finally(refreshList)
  }

  const addShoppingListToCart = (listId) => {
    cartApi.addShoppingList([listId,currency.value,country.value])
    .then(
      ()=>cart.refreshCart()
    )
  }
  const addLineItemToCart = (productId,quantity,variantId) => {
    cartApi.addShoppingListItem([
      productId,
      variantId,
      quantity,
      currency.value,
      country.value
    ])
    .then(
      ()=>cart.refreshCart()
    )

  }
  onMounted(getShoppingList);
  watch(auth,()=>{
    shoppingListApi.resetCache();
    getShoppingList();
  })
  return {
    shoppingLists,
    getShoppingList,
    addToShoppingList,
    removeLineItem,
    changeQuantity,
    addShoppingListToCart,
    addLineItemToCart,
    removeList
  };
};
export const SHOPPING_LIST = 'SHOPPING_LIST';