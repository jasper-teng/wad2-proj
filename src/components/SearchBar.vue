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
                console.warn('Google Maps not loaded yet')
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
        clearError() {
            this.addressError = ''
        },
        clearAddress() {
            this.addressInput = ''
            this.addressError = ''
            this.$emit('clear-location')
        }
    },
    mounted() {
        this.initAutocomplete()
    }
}
</script>

<template>
    <div class="row mb-3">
        <div class="col-md-12">
            <label for="addressInput" class="form-label">
                <i class="fas fa-map-marker-alt"></i> Your Address
            </label>
            <input
                type="text"
                class="form-control"
                id="addressInput"
                ref="addressInput"
                v-model="addressInput"
                placeholder="Enter your address in Singapore (e.g., Orchard Road, Singapore)"
                autocomplete="off"
                @focus="clearError"
            >
            <div v-if="addressError" class="text-danger mt-1">
                {{ addressError }}
            </div>
            <small class="text-muted">Start typing to see address suggestions</small>
        </div>
    </div>
</template>

<style scoped>
#addressInput {
    font-size: 1rem;
}

#addressInput:focus {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
