<template>
  <!-- SVG-based flag icon using country-flag-icons library -->
  <span 
    v-if="validCountryCode" 
    class="flag-icon-wrapper" 
    :style="wrapperStyle"
  >
    <img 
      :src="flagSvgPath" 
      :alt="`${countryCode} flag`"
      class="flag-svg"
      :style="imgStyle"
      @error="handleImageError"
    />
  </span>
  <!-- Fallback: Display country code if flag not available -->
  <span 
    v-else 
    class="flag-fallback" 
    :style="fallbackStyle"
  >
    {{ countryCode.toUpperCase() }}
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  countryCode: string  // ISO 3166-1 alpha-2 code (e.g., 'US', 'GB', 'CN')
  size?: number        // Size in pixels
  squared?: boolean    // Use 1x1 aspect ratio instead of 4x3
}>(), {
  size: 24,
  squared: false
})

const imageError = ref(false)

// Validate country code (must be 2-letter ISO code)
const validCountryCode = computed(() => {
  return !imageError.value && 
         props.countryCode && 
         props.countryCode.length === 2 &&
         /^[A-Za-z]{2}$/.test(props.countryCode)
})

// Generate SVG path for flag
// country-flag-icons provides flags in /node_modules/country-flag-icons/3x2/ or /1x1/
const flagSvgPath = computed(() => {
  const code = props.countryCode.toUpperCase()
  const ratio = props.squared ? '1x1' : '3x2'
  // Try to load from node_modules (Vite will handle this)
  try {
    // Dynamic import will be handled by Vite's asset pipeline
    return new URL(`/node_modules/country-flag-icons/${ratio}/${code}.svg`, import.meta.url).href
  } catch (e) {
    console.warn(`Flag icon not found for country code: ${code}`)
    return ''
  }
})

const handleImageError = () => {
  imageError.value = true
  console.warn(`Failed to load flag for: ${props.countryCode}`)
}

const wrapperStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${props.size}px`,
  height: props.squared ? `${props.size}px` : `${props.size * 2 / 3}px`,
  flexShrink: 0,
}))

const imgStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'contain' as const,
}))

const fallbackStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${props.size}px`,
  height: props.squared ? `${props.size}px` : `${props.size * 2 / 3}px`,
  fontSize: `${props.size * 0.4}px`,
  fontWeight: 'bold',
  color: '#666',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ddd',
  borderRadius: '2px',
  flexShrink: 0,
  userSelect: 'none' as const,
}))
</script>

<style scoped lang="scss">
.flag-icon-wrapper {
  overflow: hidden;
  border-radius: 2px;
}

.flag-svg {
  display: block;
}

.flag-fallback {
  font-family: monospace;
}
</style>










