<script src="./ShoppingListProduct.js"></script>

<template>
  <div v-if="product">
    <div class="cart-img">
      <router-link
        :to="
          productRoute(product.slug, product.sku)
        "
      >
        <img
          :src="displayedImageUrl(product)"
          :alt="product.name"
        />
      </router-link>
    </div>
    <div class="cart-title">
      <h4>
        <router-link
          :to="
            productRoute(product.slug, product.sku)
          "
          data-test="shopping-list-item-link"
        >
          {{ product.name }}
        </router-link>
      </h4>
      <input type="number" :value="quantity" @keyup="amountChange" />
    </div>
  </div>
</template>
