<script src="./AddToShoppingList.js"></script>
<style lang="scss" src="./AddToShoppingList.scss"></style>
<i18n src="./AddToShoppingList.txt"></i18n>

<template>
  <ProductQuickView 
    :showModal="showModal" 
    :productSku="productSku"
    modalName="addToShoppingList"
    @close-modal="closeModal"
  />
</template>
