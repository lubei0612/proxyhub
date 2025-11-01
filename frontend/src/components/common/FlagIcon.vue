<template>
  <span :class="['flag-icon', flagClass]" :title="countryName"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  countryCode: string;
}

const props = defineProps<Props>();

const flagClass = computed(() => {
  return `fi fi-${props.countryCode.toLowerCase()}`;
});

const countryName = computed(() => {
  const countryNames: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    JP: 'Japan',
    DE: 'Germany',
    FR: 'France',
    CA: 'Canada',
    AU: 'Australia',
    SG: 'Singapore',
    HK: 'Hong Kong',
    KR: 'South Korea',
    // Add more as needed
  };
  return countryNames[props.countryCode] || props.countryCode;
});
</script>

<style scoped>
.flag-icon {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  border-radius: 2px;
  vertical-align: middle;
}
</style>

