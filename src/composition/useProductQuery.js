import { computed, onMounted, ref, watch } from '@vue/composition-api';
import products from '../api/products';
import { selectChannel, selectCurrency } from './selectors';
import useCountry from './useCountry';
import useLocale from './useLocale';
import useStore from './useStore';
export default (props,ctx,sku=ref(null),id,variantId) => {
  //step one to solve race condition
  const requested = {current:null};
  //example of watching locale
  const product = ref(null);
  const variants = ref(null);
  const masterVariant = ref(null);
  const locale = useLocale();
  const country = useCountry();
  const currency = useStore(ctx, selectCurrency);
  const channel = useStore(ctx, selectChannel);
  const currentProduct = computed(()=>
    product.value || {}
  );
  const staged = computed(()=>Boolean(ctx?.root?.$route?.query?.staged))
  const availability = computed(()=>
    currentProduct.value?.availability?.channels?.[channel.value?.id]
  );
  const availableQuantity = computed(()=>
    availability.value?.availableQuantity
  );
  const availableQ = computed(()=>
    availableQuantity.value !== undefined
  );
  const isOnStock = computed(()=>{
    const inStock = availability.value?.isOnStock;
    return typeof inStock !== "boolean"
      ? true
      : inStock
  });
  const getProductProjection = () => {
    if(!(sku.value || id)){
      return
    }
    const query = {
      priceCurrency: currency.value,
      'filter.query': `variants.sku:"${sku.value}"`,
      priceCountry: country.value,
      priceChannel: channel.value?.id,
    };
    if(staged.value){
      query.staged=true
    }
    if(id){
      query.id = id;
    }
    //step 2 in fixing race condition
    const current = {};
    requested.current=current;
    //@todo: shows the race condition switch from de to us and then to de
    //  within 2 seconds and the price will show usd amount in euro
    products.get(
      [query,{},locale.value,[]]
    ).then(
      (response)=>{
        //step 3 in fixing race condition
        if(requested.current!==current){
          //do not set observable ref if this wasn't the last
          //  requested product that resolved
          return;
        }
        const p = id ? response : response.results[0]
        const name = p?.name[locale.value]
        const slug = p?.slug[locale.value]
        const allVariants = p.variants.concat(p.masterVariant).map(
          p=>({...p,name,slug})
        )
        variants.value = allVariants;
        product.value = allVariants.find(v=>sku.value
          ? v.sku===sku.value
          : v.id===variantId
        );
        masterVariant.value = {...p.masterVariant,name,slug};
      }
    )
  }
  watch(
    [currency,locale,country, sku,channel],
    ()=>{
      getProductProjection();
    }
  );
  onMounted(getProductProjection);
  return { 
    product,
    variants,
    masterVariant,
    currentProduct,
    availability,
    availableQ,
    availableQuantity,
    isOnStock
  }
};