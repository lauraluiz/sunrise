<style src="./PageProductOverview.scss" lang="scss"></style>
<i18n src="./PageProductOverview.txt"></i18n>
<script src="./PageProductOverview.js"></script>

<template>
  <div>
    <Breadcrumb :categorySlug="categorySlug" />
    <ProductList
      @open-quick-view="openProductQuickView"
      @open-add-shopping-list="openAddToShoppingList"
      :categorySlug="categorySlug"
      :page="page"
    />
    <ProductQuickView
      :showModal="showProductQuickView"
      :productSku="productSku"
      @close-modal="closeProductQuickView"
    />
    <AddToShoppingList
      :showModal="showAddToShoppingList"
      :productSku="productSku"
      @close-modal="closeAddToShoppingList"
    />
  </div>
</template>
