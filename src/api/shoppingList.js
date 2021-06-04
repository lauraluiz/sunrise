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
const resetCache = ()=>cache.clear();
const shoppingList = {
  get: withToken((query={},accessToken) => {
    const url = new URL(`${baseUrl}/me/shopping-lists`);
    if(query.name){
      url.searchParams.append('where', `name(en="${query.name}")`)
    }
    return groupFetchJson(
      url,
      makeConfig(accessToken)
    );
  }),
  create: withToken((query,accessToken) => {
    return groupFetchJson(
      new URL(`${baseUrl}/me/shopping-lists`),
      {
        method: "POST",
        body: JSON.stringify({
          key: query.name,
          name: {
            en: query.name,
          },
        }),
        ...makeConfig(accessToken),
      }
    );
  }),
  remove: withToken((list,accessToken) => {
    return groupFetchJson(
      new URL(`${baseUrl}/me/shopping-lists/${list.id}?version=${list.version}`),
      {
        method: "DELETE",
        ...makeConfig(accessToken),
      }
    );
  }),
  setQuantity: withToken(
    ([sku, quantity, listId, version, lineItemId], accessToken) => {
      return groupFetchJson(
        new URL(`${baseUrl}/me/shopping-lists/${listId}`),
        {
          method: "POST",
          body: JSON.stringify({
            version,
            actions: [
              {
                action: "changeLineItemQuantity",
                lineItemId,
                quantity,
                sku
              },
            ],
          }),
          ...makeConfig(accessToken),
        }
      );
    }
  ),
  addItem: withToken(
    ([sku, quantity, listId, version], accessToken) => {
      return groupFetchJson(
        new URL(`${baseUrl}/me/shopping-lists/${listId}`),
        {
          method: "POST",
          body: JSON.stringify({
            version,
            actions: [
              {
                action: "addLineItem",
                quantity,
                sku
              },
            ],
          }),
          ...makeConfig(accessToken),
        }
      );
    }
  ),
  removeItem: withToken(
    ([lineItemId, listId, version], accessToken) => {
      return groupFetchJson(
        new URL(`${baseUrl}/me/shopping-lists/${listId}`),
        {
          method: "POST",
          body: JSON.stringify({
            version,
            actions: [
              {
                action: "removeLineItem",
                lineItemId,
              },
            ],
          }),
          ...makeConfig(accessToken),
        }
      );
    }
  ),
  resetCache
};

export default shoppingList;
