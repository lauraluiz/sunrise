import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner.vue';
import ShoppingList from '../../../header/ShoppingList/ShoppingList.vue'

export default {
  components: {
    LoadingSpinner,
    ShoppingList
  },
  setup(props,ctx) {
    return {
      shoppingListName: ctx.root.$route.params.listName
    }
  },
  methods: {
    deleteList(list) {
      this.removeList(list)
    }
  }
};
