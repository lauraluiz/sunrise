<style src="./ProductInfo.scss" lang="scss" scoped></style>
<i18n src="./ProductInfo.txt"></i18n>
<script src="./ProductInfo.js"></script>

<template>
  <div class="row" v-if="product">
    <div class="col-lg-5">
      <div class="product-details-tab">
        <ProductGallery :sku="sku" />
      </div>
    </div>
    <div class="col-lg-7">
      <div
        class="product-details-content product-details-ptb"
        data-test="product-data"
      >
        <h2 data-test="product-name">
          {{ currentProduct.name }}
        </h2>
        <h3>
          <BasePrice :price="currentProduct.price" />
        </h3>
        <VariantSelector :sku="sku" />
        <div v-if="availableQ">
          {{ $t("available") }}: {{ availableQuantity }}
        </div>
        <AddToCartForm
          :sku="sku"
          :isOnStock="isOnStock"
          :availableQuantity="availableQuantity"
        />
        <a href @click.prevent="openAddToShoppingList">
          <i class="dl-icon-heart"></i><span>Shopping list</span>
        </a>

        <DetailsSection :sku="sku" />
      </div>
    </div>
  </div>
</template>
