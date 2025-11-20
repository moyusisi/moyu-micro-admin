<template>
  <div v-if="route.meta.type === 'iframe'" class="admin-iframe">
    <iframe :key="route.meta.url" :src="route.meta.url"></iframe>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

</script>

<style scoped>
.admin-iframe {
  width: 100%;
  height: 100%;
  background: #fff;
}

iframe {
  border: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
