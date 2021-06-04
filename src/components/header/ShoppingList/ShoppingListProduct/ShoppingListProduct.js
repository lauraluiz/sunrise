import useProductQuery from '../../../../composition/useProductQuery';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    lineItemId: {
      type: String,
      required: true,
    },
    variantId: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  setup(props,ctx) {
    const {product} = useProductQuery(
      props,
      ctx,
      undefined,
      props.id,
      props.variantId
    );
    return {
      product
    };
  },
  methods: {
    displayedImageUrl(variant) {
      if (Array.isArray(variant.images) && variant.images.length) {
        return variant.images[0].url;
      }
      return null;
    },
    amountChange(e) {
      const newAmount = Number(e.target.value)
      if(!isNaN(newAmount) && newAmount>0){
        this.$emit('amountChange',newAmount,this.product.sku,this.lineItemId)
      }
    },
    productRoute(productSlug, sku) {
      return {
        name: 'product',
        params: { productSlug, sku },
      };
    },
  },
};
