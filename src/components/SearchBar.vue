<script>
export default {
  data() {
    return {
      addressInput: '',
      addressError: '',
      autocomplete: null
    }
  },
  methods: {
    getSessionHomeAddress() {
      const homeName = JSON.parse(sessionStorage.getItem("home name"));
      const homeCoord = JSON.parse(sessionStorage.getItem("home"));
      
      if (homeName && addressInput && addressInput.value === "") {
        this.addressInput = homeName;
        this.$emit('location-change', homeCoord)
      }
    },
    initAutocomplete() {
      if (typeof google !== 'undefined' && google.maps) {
        const input = this.$refs.addressInput
        this.autocomplete = new google.maps.places.Autocomplete(input, {
          componentRestrictions: { country: 'sg' },
          fields: ['formatted_address', 'geometry', 'name']
        })

        this.autocomplete.addListener('place_changed', this.onPlaceChanged)
        console.log('Address autocomplete initialized')
      } else {
        console.warn('Google Maps not loaded yet, retrying...')
        setTimeout(() => this.initAutocomplete(), 500)
      }
    },

    onPlaceChanged() {
      const place = this.autocomplete.getPlace()
      this.addressError = ''

      if (!place.geometry || !place.geometry.location) {
        this.addressError = 'Please select a valid address from the suggestions.'
        this.$emit('location-change', null)
        return
      }

      const location = {
        address: place.formatted_address || place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }

      console.log('User location selected:', location)
      this.$emit('location-change', location)
    },

    clearLocation() {
      this.addressInput = ''
      this.addressError = ''
      this.$emit('location-change', null)
    }
  },

  mounted() {
    this.initAutocomplete();
    this.getSessionHomeAddress();
  }
}
</script>

<template>
  <div class="mb-4">
    <label for="addressInput" class="form-label fw-semibold">Address</label>
    <input
      ref="addressInput"
      type="text"
      class="form-control"
      id="addressInput"
      placeholder="Enter your address"
      v-model="addressInput"
    />
    <div v-if="addressError" class="text-danger mt-1">
      {{ addressError }}
    </div>
  </div>
</template>

<style scoped>
</style>