/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
import {
  withToken,
  groupApi,
  fetchJson,
  makeConfig,
  baseUrl,
} from "./api";
// import config from "../../sunrise.config";
// import { locale } from "../components/common/shared";
const cache = new Map();
const groupFetchJson = groupApi(fetchJson,cache);
const resetCartCache = ()=>cache.clear();


const get = withToken((accessToken) => {
  const url = new URL(`${baseUrl}/me/active-cart`);
  return groupFetchJson(
    url,
    makeConfig(accessToken)
  );
});
const create = withToken(([currency,country],accessToken) => {
  return groupFetchJson(
    new URL(`${baseUrl}/me/carts`),
    {
      method: "POST",
      body: JSON.stringify({
        currency,
        country,
        shippingAddress: { country },
        //@todo: implement inventory mode: src/mixins/cartMixin.js
      }),
      ...makeConfig(accessToken),
    }
  );
});
const getOrCreate = (currency,country) => get()
  .then(
    (result)=>{
      if(result.statusCode===404){
        return create([currency,country])
      }
      return result
    }
  );
const cart = {
  get,
  create,
  addShoppingList: withToken(
    ([shoppingListId,currency,country], accessToken) => {
      return getOrCreate(currency,country).then(
        (cart)=>{
          const id = cart.id
          const version = cart.version
          return groupFetchJson(
            new URL(`${baseUrl}/me/carts/${id}`),
            {
              method: "POST",
              body: JSON.stringify({
                version,
                actions: [
                  {
                    action: "addShoppingList",
                    shoppingList:{
                      id:shoppingListId
                    },
                  },
                ],
              }),
              ...makeConfig(accessToken),
            }
          );
        }
      )
    }
  ),
  addShoppingListItem: withToken(
    ([productId, variantId, quantity,currency,country], accessToken) => {
      return getOrCreate(currency,country).then(
        (cart)=>{
          return groupFetchJson(
            new URL(`${baseUrl}/me/carts/${cart.id}`),
            {
              method: "POST",
              body: JSON.stringify({
                version:cart.version,
                actions: [
                  {
                    action: "addLineItem",
                    productId,
                    variantId,
                    quantity
                  },
                ],
              }),
              ...makeConfig(accessToken),
            }
          );
    
        }
      )
    }
  ),
  resetCartCache
};

export default cart;
