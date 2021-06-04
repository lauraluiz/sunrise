/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
import SdkAuth, { TokenProvider } from '@commercetools/sdk-auth';
import store from './store';
import config from '../sunrise.config';
import { group } from './api/lib';

const ANONYMOUS = 'ANONYMOUS';
const PASSWORD = 'PASSWORD';
const REFRESH_USER = 'REFRESH_USER';
const REFRESH_ANONYMOUS = 'REFRESH_ANONYMOUS';
const tokenProvider = new TokenProvider({
  sdkAuth: new SdkAuth(config.ct.auth),
  onTokenInfoChanged: (tokenInfo) => {
    const { refreshToken } = tokenProvider;
    if (tokenProvider.flowType === REFRESH_USER || tokenProvider.flowType === REFRESH_ANONYMOUS) {
      // when refreshing token the token info is a differnt entity
      //  and is missing the refresh_token
      tokenInfo = { ...tokenInfo, refresh_token: refreshToken };
    }
    if (tokenProvider.flowType === PASSWORD || tokenProvider.flowType === REFRESH_USER) {
      return store.dispatch('setAuthenticated', tokenInfo);
    }
    return store.dispatch('setTokenInfo', tokenInfo);
  },
  fetchTokenInfo: (sdkAuth) => sdkAuth.anonymousFlow(),
}, store.state.authenticated || store.state.tokenInfo);
tokenProvider.flowType = ANONYMOUS;

export function cleanUpSession() {
  return tokenProvider.invalidateTokenInfo();
}

export function clientLogin(apolloClient, credentials) {
  tokenProvider.fetchTokenInfo = (sdkAuth) => sdkAuth.customerPasswordFlow(credentials);
  tokenProvider.flowType = PASSWORD;
  cleanUpSession();
  return apolloClient.resetStore()
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error on cache reset during login', error);
    });
}

export function clientLogout(apolloClient, redirect) {
  tokenProvider.fetchTokenInfo = (sdkAuth) => sdkAuth.anonymousFlow();
  tokenProvider.flowType = ANONYMOUS;
  cleanUpSession();
  return store.dispatch('setAuthenticated', false)
    .then(() => redirect())
    .then(() => apolloClient.resetStore())
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error on cache reset during logout', error);
    });
}

function getToken(error, tries) {
  let promise;
  tries++;
  if (tries > 2) {
    return Promise.reject(new Error('Unable to get token'));
  }
  if (error) {
    if (tokenProvider.flowType === REFRESH_ANONYMOUS || tokenProvider.flowType === REFRESH_USER) {
      tokenProvider.flowType = ANONYMOUS;
      tokenProvider.fetchTokenInfo = (sdkAuth) => sdkAuth.anonymousFlow();
      cleanUpSession();
      promise = tokenProvider.getTokenInfo();
    } else {
      const refreshToken = store.state.authenticated?.refresh_token
        || store.state.tokenInfo?.refresh_token;
      const isUserToken = refreshToken === store.state.authenticated?.refresh_token;
      if (!refreshToken) {
        return getToken(true, tries);
      }
      tokenProvider.flowType = isUserToken ? REFRESH_USER : REFRESH_ANONYMOUS;
      tokenProvider.refreshToken = refreshToken;
      tokenProvider.fetchTokenInfo = (sdkAuth) => sdkAuth.refreshTokenFlow(
        refreshToken,
      );
      cleanUpSession();
      promise = tokenProvider.getTokenInfo();
    }
  } else {
    promise = tokenProvider.getTokenInfo();
  }
  return promise.catch((error) => {
    // eslint-disable-next-line no-console
    console.warn('Could not connect to commercetools, cleaning up session...', error);
    return getToken(true, tries);
  });
}

export const getAuthToken = group((error) => getToken(error, 0)
  .then(
    (tokenInfo) => `${tokenInfo.token_type} ${tokenInfo.access_token}`,
  ), new Map(), false, () => 'getAuthToken');
