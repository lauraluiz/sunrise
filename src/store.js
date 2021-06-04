import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import sunriseConfig from "../sunrise.config";

Vue.use(Vuex);

const SET_PAYMENT = "SET_PAYMENT";
const SET_LOCALE = "SET_LOCALE";
const SET_COUNTRY = "SET_COUNTRY";
const SET_CUSTOMER_GROUP = "SET_CUSTOMER_GROUP";
const SET_CURRENCY = "SET_CURRENCY";
const SET_CHANNEL = "SET_CHANNEL";
const SET_STORE_NAME = "SET_STORE_NAME";
const SET_AUTHENTICATED = "SET_AUTHENTICATED";
const SET_TOKEN_INFO = "SET_TOKEN_INFO";
const SET_MINI_CART_OPEN = "SET_MINI_CART_OPEN";
const SET_CART_ITEMS = "SET_CART_ITEMS";

const availableLocales = Object.keys(
  sunriseConfig.languages
);
const availableCountries = Object.keys(
  sunriseConfig.countries
);

export const fallbackLocale = availableLocales[0];
const fallbackCountry = availableCountries[0];
const channel = sunriseConfig?.channels?.[fallbackCountry]
  ? {id:sunriseConfig.channels[fallbackCountry]}
  : null
const obtainCurrency = (country) =>
  sunriseConfig.formats.number[country]?.currency?.currency;

const clearMiniCartTimeout = (state) => {
  if (state.miniCartCloseTimer !== 0) {
    clearTimeout(state.miniCartCloseTimer);
  }
};

const setMiniCartTimeout = (commit, state, timeout) => {
  state.miniCartCloseTimer = setTimeout(
    () => commit(SET_MINI_CART_OPEN, false),
    timeout
  );
};

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      key: "session",
      paths: [
        "payment",
        "locale",
        "country",
        "currency",
        "tokenInfo",
        "authenticated",
        "customerGroup",
        "channel",
        "storeName",
      ],
    }),
  ],

  state: {
    locale: fallbackLocale,
    country: fallbackCountry,
    currency: obtainCurrency(fallbackCountry),
    channel,
    storeName: null,
    tokenInfo: null,
    authenticated: false,
    miniCartOpen: false,
    miniCartCloseTimer: 0,
    cartItems: 0,
  },

  actions: {
    setPayment: ({ commit }, payment) => {
      commit(SET_PAYMENT, payment);
    },
    setLocale: ({ commit }, locale) => {
      if (availableLocales.includes(locale))
        commit(SET_LOCALE, locale);
    },
    setCustomerGroup: ({ commit }, customerGroup) => {
      commit(SET_CUSTOMER_GROUP, customerGroup);
    },

    setChannel: ({ commit }, channel) => {
      commit(SET_CHANNEL, channel);
    },

    setStoreName: ({ commit }, storeName) => {
      commit(SET_STORE_NAME, storeName);
    },

    setCountry: ({ commit }, country) => {
      if (availableCountries.includes(country)) {
        commit(SET_COUNTRY, country);
        commit(SET_CURRENCY, obtainCurrency(country));
      }
    },

    setAuthenticated: ({ commit }, authenticated) =>
      commit(SET_AUTHENTICATED, authenticated),

    setTokenInfo: ({ commit }, tokenInfo) =>
      commit(SET_TOKEN_INFO, tokenInfo),

    clearAuthentication: ({ commit }) => {
      commit(SET_TOKEN_INFO, null);
      commit(SET_AUTHENTICATED, false);
      commit(SET_CHANNEL, null);
    },

    openMiniCart: ({ commit, state }, timeout = 2000) => {
      clearMiniCartTimeout(state);
      commit(SET_MINI_CART_OPEN, true);
      if (timeout !== 0) {
        setMiniCartTimeout(commit, state, timeout);
      }
    },

    closeMiniCart: ({ commit, state }, timeout = 0) => {
      clearMiniCartTimeout(state);
      if (timeout !== 0) {
        setMiniCartTimeout(commit, state, timeout);
      } else {
        commit(SET_MINI_CART_OPEN, false);
      }
    },

    toggleMiniCart: ({ commit, state }) => {
      commit(SET_MINI_CART_OPEN, !state.miniCartOpen);
    },

    setCartItems: ({ commit }, cartItems) => {
      commit(SET_CART_ITEMS, cartItems);
    },
  },

  mutations: {
    [SET_COUNTRY](state, country) {
      state.country = country;
    },

    [SET_CURRENCY](state, currency) {
      state.currency = currency;
    },

    [SET_LOCALE](state, locale) {
      state.locale = locale;
    },
    [SET_CUSTOMER_GROUP](state, customerGroup) {
      state.customerGroup = customerGroup;
    },
    [SET_PAYMENT](state, payment) {
      state.payment = payment;
    },

    [SET_CHANNEL](state, channel) {
      state.channel = channel;
    },

    [SET_STORE_NAME](state, storeName) {
      state.storeName = storeName;
    },

    [SET_AUTHENTICATED](state, authenticated) {
      state.authenticated = authenticated;
      state.tokenInfo = null;
    },

    [SET_TOKEN_INFO](state, tokenInfo) {
      state.tokenInfo = tokenInfo;
    },

    [SET_MINI_CART_OPEN](state, miniCartOpen) {
      state.miniCartOpen = miniCartOpen;
    },
    [SET_CART_ITEMS](state, cartItems) {
      state.cartItems = cartItems;
    },
  },
});
