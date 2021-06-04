/* eslint-disable no-param-reassign */
import gql from 'graphql-tag';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner.vue';
import ProductFilter from '../ProductFilter/ProductFilter.vue';
import ProductThumbnail from '../../common/ProductThumbnail/ProductThumbnail.vue';
import TopBar from '../TopBar/TopBar.vue';
import Pagination from '../../common/Pagination/Pagination.vue';

import { products, onlyLastRequestedPromise } from '../../../api';
import {
  pushPage, locale, modifyQuery, changeRoute,
} from '../../common/shared';
import sunriseConfig from '../../../../sunrise.config';

const removeHiddenFacetFromQuery = (facets, component) => {
  const facetObject = facets.reduce(
    (result, { name, terms }) => result.set(
      name,
      terms.map((t) => t.term),
    ),
    new Map(),
  );
  const facetKeys = sunriseConfig.facetSearches.map(({ name }) => name);
  // see if facets are in query that are missing in facets
  const missing = Object.entries(component.$route.query)
    .map(
      ([key, value]) => [key, [].concat(value)],
    ).reduce(
      (result, [key, values]) => result.concat(
        values.map((v) => [key, v]),
      ), [],
    ).filter(
      ([key]) => facetKeys.includes(key),
    )
    .filter(
      ([key, value]) => !(facetObject.get(key) || [])
        .includes(value),
    );
  if (missing.length) {
    // remove the facets that are missing from query
    const query = missing.reduce(
      (result, [key, value]) => modifyQuery(
        key, value, result, false,
      ),
      component.$route.query,
    );
    changeRoute(
      {
        ...component.$route,
        query,
      },
      component,
      false,
    );
  }
};
const last = onlyLastRequestedPromise('products');
const getProducts = (component) => {
  const {
    category,
    currency,
    country,
    loc,
    searchText,
    sort,
    priceFilter,
    priceChannel,
  } = products.paramsFromComponent(component);
  if (
    !category
    && component.$route.params.categorySlug !== 'all'
  ) {
    return;
  }
  component.loadingProducts = true;
  component.loadingFacets = true;
  const route = component.$route;
  last(
    products.get([
      {
        category,
        priceChannel,
        page: Number(route.params?.page || 1),
        pageSize: component.limit,
        priceCurrency: currency,
        priceCountry: country,
        ...sort,
        ...priceFilter,
        ...searchText,
      },
      route.query,
      loc,
    ]),
  ).then(({ facets, results, ...meta }) => {
    removeHiddenFacetFromQuery(
      facets,
      component,
    );
    component.products = {
      ...meta,
      results: results.map(
        ({
          id, masterVariant: { sku, images, price }, name, slug,
        }) => ({
          id,
          masterData: {
            current: {
              name: name[loc],
              slug: slug[loc],
              masterVariant: {
                sku,
                images,
                price,
              },
            },
          },
        }),
      ),
    };
    component.facets = facets;
    component.loadingProducts = false;
    component.loadingFacets = false;
  });
};
export default {
  props: ['categorySlug', 'page'],
  components: {
    LoadingSpinner,
    ProductThumbnail,
    Pagination,
    ProductFilter,
    TopBar,
  },
  data: () => ({
    categories: null,
    products: null,
    facets: null,
    sort: null,
    limit: Number(process.env.VUE_APP_PAGE_SIZE || 12),
    loadingProducts: false,
    loadingFacets: false,
    show: false,
    facetFilter: {},
    allChannels: false,
  }),
  computed: {
    category() {
      return this.categories.results[0];
    },
    countyCurrency() {
      return {
        currency: this.$store.state.currency,
        country: this.$store.state.country,
      };
    },
    hasManyProducts() {
      return this.products?.results.length >= this.limit / 2;
    },
    offset() {
      return (this.page - 1) * this.limit;
    },
    totalProducts() {
      return this.products.total;
    },
    isLoading() {
      return this.loadingProducts || this.$apollo.loading;
    },
  },
  methods: {
    changeSort(sort) {
      this.sort = sort;
      const query = { ...this.$route.query, sort };
      if (sort === null) {
        delete query.sort;
      }
      changeRoute(
        {
          ...this.$route,
          query,
        }, this,
      );
    },
    facetFilterChange({ name, value }) {
      this.facetFilter = { ...this.facetFilter, [name]: value };
    },
    channelChange(value) {
      this.allChannels = value;
    },
    changePage(page) {
      pushPage(page, this, 'products');
    },
    showScroll(el) {
      // eslint-disable-next-line no-param-reassign
      el.style.display = window.innerHeight > 300
       && window.scrollY > 200 ? '' : 'none';
    },
    openQuickView(productInfo) {
      this.$emit('open-quick-view', productInfo);
    },
    openAddToShoppingList(productInfo) {
      this.$emit('open-add-shopping-list', productInfo);
    },
    toggleFilter() {
      this.show = !this.show;
    },
  },
  apollo: {
    categories: {
      query: gql`
        query categories($where: String) {
          categories(where: $where, limit: 1) {
            results {
              id
            }
          }
        }`,
      variables() {
        return {
          where: `slug(${locale(this)}="${this.categorySlug}")`,
        };
      },
      skip: (vm) => !vm.categorySlug,
    },
  },
  watch: {
    $route() {
      getProducts(this);
    },
    categories() {
      getProducts(this);
    },
    countyCurrency() {
      getProducts(this);
    },
  },
};
