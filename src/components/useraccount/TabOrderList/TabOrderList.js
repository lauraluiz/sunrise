import gql from "graphql-tag";
import BaseMoney from "../../common/BaseMoney/BaseMoney.vue";
import BaseDate from "../../common/BaseDate/BaseDate.vue";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner.vue";
import MONEY_FRAGMENT from "../../Money.gql";
import {
  pageFromRoute,
  pushPage,
} from "../../common/shared";
import Pagination from "../../common/Pagination/Pagination.vue";

export default {
  components: {
    BaseMoney,
    BaseDate,
    LoadingSpinner,
    Pagination,
  },
  data: () => ({
    me: null,
    limit: Number(process.env.VUE_APP_PAGE_SIZE || 10),
  }),
  computed: {
    isLoading() {
      return this.$apollo.loading || !this.me;
    },
    page() {
      return pageFromRoute(this.$route).page;
    },
    orders() {
      return this.isLoading ? [] : this.me?.orders.results;
    },
    orderListNotEmpty() {
      return this.me?.orders?.results.length > 0;
    },
    total() {
      return this.me?.orders.total;
    },
    disablePagePrev() {
      return this.page === 1;
    },
  },
  methods: {
    translateStatus(state) {
      return state ? this.$t(state) : "-";
    },
    paymentInfo(order) {
      return this.$t(
        order?.paymentInfo?.payments?.[0]?.paymentStatus
          ?.interfaceCode
      );
    },
    pushPage(page) {
      pushPage(page, this, "orders");
    },
    changePage(page) {
      this.pushPage(page);
    },
  },
  apollo: {
    me: {
      query: gql`
        query MyOrders($limit: Int, $offset: Int) {
          me {
            orders(
              sort: "createdAt desc"
              limit: $limit
              offset: $offset
            ) {
              total
              results {
                id
                orderNumber
                totalPrice {
                  ...MoneyFields
                }
                createdAt
                shipmentState
                paymentState
                paymentInfo {
                  payments {
                    paymentStatus {
                      interfaceCode
                    }
                  }
                }
              }
            }
          }
        }
        ${MONEY_FRAGMENT}
      `,
      variables() {
        const { page, limit } = this;
        return {
          limit,
          offset: (page - 1) * limit,
        };
      },
    },
  },
};
