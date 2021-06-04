import { computed, inject } from '@vue/composition-api';
import { SHOPPING_LIST } from '../../../composition/useShoppingList';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner.vue';

export default {
  components: {
    LoadingSpinner,
  },
  setup() {
    const {shoppingLists,removeList} = inject(SHOPPING_LIST);
    const isLoading = computed(
      ()=>!(shoppingLists.value)
    )
    const shoppingListNotEmpty = computed(
      ()=>(shoppingLists.value?.length||0)>0
    )
    return {
      shoppingLists,
      isLoading,
      shoppingListNotEmpty,
      removeList
    }
  },
  methods: {
    deleteList(list) {
      this.removeList(list)
    }
  }
};
