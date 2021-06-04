import ProductGallery from '../../productdetail/ProductGallery/ProductGallery.vue';
import SocialMediaLinks from '../../productdetail/SocialMediaLinks/SocialMediaLinks.vue';
import DetailsSection from '../../productdetail/DetailsSection/DetailsSection.vue';
import AddToCartForm from '../../productdetail/AddToCartForm/AddToCartForm.vue';
import BasePrice from '../../common/BasePrice/BasePrice.vue';
import VariantSelector from '../../productdetail/VariantSelector/VariantSelector.vue';
import useProductQuery from '../../../composition/useProductQuery';
import { computed, inject, provide, ref, watch } from 'vue-demi';

export default {
  data: () => ({
    quantity: 1,
  }),
  components: {
    DetailsSection,
    ProductGallery,
    SocialMediaLinks,
    AddToCartForm,
    BasePrice,
    VariantSelector,
  },
  props: {
    showModal: Boolean,
    productSku: String,
    modalName: {
      type:String,
      default:"quickView"
    }
  },
  setup(props,ctx){
    const sku = ref(props.productSku)
    provide('onVariantSelect', (newSku)=>
      sku.value=newSku
    );
    watch(props,(props)=>{
      sku.value=props.productSku;
    });
    const override = inject('ADD_TO_SHOPPING_LIST',{
      name:false,
      onAdd:false,
      addCaption:undefined
    });
    const showName = computed(()=>override.name!==false)
    return {
      ...useProductQuery(props,ctx,sku),
      ...override,
      showName,
      sku
    };
  },
  watch: {
    showModal() {
      if (this.showModal === true) {
        this.$modal.show(this.modalName);
      }else{
        this.$modal.hide(this.modalName);
        this.$emit('close-modal');  
      }
    },
  },
  methods: {
    closeModal() {
      this.$modal.hide(this.modalName);
      this.$emit('close-modal');
      this.quantity = 1;
    },
    productAdded() {
      this.closeModal();
    },
  },
};
