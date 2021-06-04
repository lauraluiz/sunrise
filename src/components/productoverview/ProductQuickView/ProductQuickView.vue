<script src="./ProductQuickView.js"></script>
<style lang="scss" src="./ProductQuickView.scss"></style>
<i18n src="./ProductQuickView.txt"></i18n>

<template>
  <div>
    <modal
      styles="border-radius: 0"
      :name="modalName"
      width="1000"
      height="500"
      @closed="closeModal"
    >
      <div class="modal-body">
        <button
          type="button"
          class="close"
          @click="closeModal"
          aria-label="Close"
        >
        <span class="dl-icon-close"></span>
        </button>
        <div class="row no-gutters">
          <div class="col-lg-5 col-md-12 col-sm-12 col-xs-12">
            <ProductGallery :sku="productSku" :quickview="true" />
          </div>
          <div class="row" v-if="product">
            <div class="col-lg-12" style="padding-top:30px">
              <div
                class="product-details-content product-details-ptb"
                data-test="product-data"
              >
                <h2
                  data-test="product-name"
                >
                  {{ currentProduct.name }}
                </h2>
                <h3>
                  <BasePrice :price="currentProduct.price" />
                </h3>
                <VariantSelector :sku="sku" />
                <div v-if="availableQ">
                  {{$t('inStock')}}: {{availableQuantity}}
                </div>
                <div v-if="showName">
                  <input 
                    v-model="name"
                    placeholder="Name of the shopping list"
                  />
                </div>
                <AddToCartForm 
                  :sku="sku" 
                  :isOnStock="isOnStock" 
                  :availableQuantity="availableQuantity"
                  :onAdd="onAdd"
                  :addCaption="addCaption"
                  @product-added="productAdded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>
