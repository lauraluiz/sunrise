<i18n src="./ProductList.txt"></i18n>
<style src="./ProductList.scss" lang="scss"></style>
<script src="./ProductList.js"></script>

<template>
  <div class="shop-area pb-100">
    <LoadingSpinner v-if="isLoading" />
    <div class="custom-container" v-else-if="categories && products">
      <TopBar
        v-on:toggle-filter="toggleFilter"
        @change-sort="changeSort"
        v-bind:show="show"
        v-bind:sort="sort"
        v-bind:count="products.count"
        v-bind:offset="products.offset"
        v-bind:total="products.total"
      />
      <ProductFilter
        :facets="facets"
        :facetFilter="facetFilter"
        @filter-change="facetFilterChange"
        @channel-change="channelChange"
        :allChannels="allChannels"
        v-bind:show="show"
      />
      <div class="shop-wrapper" v-if="products.results.length">
        <div class="row">
          <ProductThumbnail
            @open-quick-view="openQuickView"
            @open-add-shopping-list="openAddToShoppingList"
            v-for="product in products.results"
            data-test="product-list"
            :key="product.id"
            :product="product"
          />
        </div>
        <Pagination
          :pageSize="limit"
          :total="totalProducts"
          :page="page"
          @pagechanged="changePage"
        />
      </div>

      <div v-else>
        <div class="empty-results-container">
          <span class="empty-results" data-test="empty-results">
            {{ $t('notFound') }}
          </span>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="empty-results-container">
        <span class="empty-results" data-test="category-not-found">
          {{ $t('categoryNotFound') }}
        </span>
      </div>
    </div>
  </div>
</template>
