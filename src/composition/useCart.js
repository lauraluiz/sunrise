import {
  computed,
  onMounted,
  ref,
  watch,
} from "@vue/composition-api";
import useCountry from './useCountry'
import useLocale from './useLocale';
import cartApi from "../api/cart";
import { selectAuth, selectCurrency } from "./selectors";
import useStore from "./useStore";
const translateLineItems = (response,locale)=>({
  ...response,
  //translate lineItems
  lineItems:(response.lineItems||[]).map(
    (item)=>({...item,name:item.name[locale]})
  )
})
export default (props,ctx) => {
  const auth = useStore(ctx,selectAuth)
  const country = useCountry();
  const currency = useStore(ctx, selectCurrency);
  const requested = { current: null };
  const cart = ref(undefined);
  const locale = useLocale();
  const getCart = () => {
    const current = {};
    requested.current = current;
    return cartApi.get().then((response) => {
      if(response.statusCode === 404){
        cart.value=null;
        return;
      }
      cart.value = translateLineItems(response,locale.value)
    })
  };
  const createCart = () => {
    return cartApi.create([currency.value,country.value]).then(
      (response)=>{
        cart.value = translateLineItems(response,locale.value)
      }
    )
  }
  const refreshCart = ()=>{
    cartApi.resetCartCache()
    return getCart()
  }
  onMounted(getCart);
  watch(auth,()=>{
    refreshCart()
  });
  const me = computed(()=>{
    return {
      activeCart:cart.value
    }
  })
  return {
    cart,
    me,
    getCart,
    createCart,
    refreshCart
  };
};
export const CART = 'CART';