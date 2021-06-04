import { locale as loc } from "../common/shared";
import MiniCart from "../header/MiniCart/MiniCart.vue";
import config from "../../../sunrise.config";
import { provide, watch,ref } from '@vue/composition-api';
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from "../../apollo";
import useShoppingList, { SHOPPING_LIST } from "../../composition/useShoppingList";
import useCart, { CART } from "../../composition/useCart";
// locale is an optional route parameter, if it's missing
// then see if it's set in store (local storage) and use that
// if it's not in store then default to en

const DEFAULT_COUNTRY = Object.keys(config.countries)[0];
const DEFAULT_LANGUAGE = Object.keys(config.countries)[0];
const checkLocale = (component) => {
  const { name, query, params } = component.$route;
  let newParams = params;
  if (!params.country) {
    const country =
      component?.$store?.state?.country || DEFAULT_COUNTRY;
    newParams = {
      ...newParams,
      country,
    };
  }
  if (!loc(component)) {
    const locale =
      component?.$store?.state?.locale || DEFAULT_LANGUAGE;
    newParams = {
      ...newParams,
      locale,
    };
  }
  if (params !== newParams) {
    component.$router.replace({
      name,
      query,
      params: newParams,
    });
  }
};
export default {
  props: {
    locale: String,
    country:String
  },
  components: {
    MiniCart,
  },
  setup(props,ctx) {
    const locale=ref(props.locale);
    const country = ref(props.country);
    watch(
      props,
      (props)=>{
        locale.value=props.locale;
        country.value=props.country;
      }
    );
    provide('locale', locale);
    provide('country', country);
    provide(DefaultApolloClient, apolloClient)
    const cart = useCart(undefined,ctx);
    provide(CART,cart)
    const shoppingList = useShoppingList(undefined,ctx,cart);
    provide(SHOPPING_LIST,shoppingList);
  },
  computed: {
    computedLocale() {
      return loc(this);
    },
    isMiniCartOpen() {
      return this.$store.state.miniCartOpen ||
        this.$store.state.shoppingListOpen
    },
  },
  methods: {
    close() {
      this.$store.dispatch("closeMiniCart");
    },
    keyUpListener(e) {
      if (e.key === "Escape") {
        this.close();
      }
    },
  },
  data() {
    return {
      sharedState: {
        expanded: false,
      },
    };
  },

  provide() {
    return {
      accordionItemState: this.sharedState,
    };
  },
  beforeCreate() {
    // when the page loads set store locale and country to what is in the url
    if (
      this?.$store?.state?.country !==
      this.$route.params.country
    ) {
      this.$store.dispatch(
        "setCountry",
        this.$route.params.country
      );
      if (config?.channels?.[this.$route.params?.country]) {
        this.$store.dispatch("setChannel", {
          id: config.channels[this.$route.params.country],
        });
      }
    }
    if (
      this?.$store?.state?.locale !==
      this.$route?.params?.locale
    ) {
      this.$store.dispatch("setLocale", loc(this));
    }
    checkLocale(this);
  },
  beforeMount() {
    document.body.addEventListener(
      "keyup",
      this.keyUpListener
    );
  },
  beforeDestroy() {
    document.body.removeEventListener(
      "keyup",
      this.keyUpListener
    );
  },
  watch: {
    $route() {
      checkLocale(this);
    },
  },
};
