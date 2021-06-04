<style src="./root.scss" lang="scss" scoped></style>
<script src="./root.js" />

<template>
<div
  v-if="computedLocale"
  class="main-wrapper main-wrapper-2 main-wrapper-3"
  :class="isMiniCartOpen ? 'overlay-active' : ''"
>
  <div @click="close()" class="body-overlay"></div>
  <MiniCart />
  <router-view name="header" />
  <router-view />
  <footer>
    <router-view name="footer" />
  </footer>
</div>

</template>
