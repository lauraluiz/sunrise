<i18n src="./PageProductDetail.txt"></i18n>
<script src="./PageProductDetail.js"></script>

<template>
  <div class="product-details-area pt-50 pb-50">
    <div class="custom-container">
      <ProductInfo 
        :sku="sku" 
        @open-add-shopping-list="openAddToShoppingList"
      />
    </div>
    <AddToShoppingList
      :showModal="showAddToShoppingList"
      :productSku="sku"
      @close-modal="closeAddToShoppingList"
    />
  </div>
</template>
