<script>

    export default{
        props:['singleModal'],

        emits:['close-modal'],
    }

</script>

<template>
                <div class="modal fade show" style="display: block;" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" v-if="singleModal">{{ singleModal.name }}</h5>
                            <button type="button" class="btn-close" @click="$emit('close-modal')"></button>
                        </div>

                        <div class="modal-body" v-if="singleModal">
                            <div v-if="singleModal.alp_domain">
                                <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill me-2">ALP</span>
                                <h4 class="modal-subtitle" >{{ singleModal.alp_domain }}</h4>
                                <p class="modal-text">{{ singleModal.alp_title }}</p>

                                <slot name="slotSingleModal1"></slot>

                            </div>
                            <div v-if="singleModal.llp_domain" class="mt-4">
                                <span class="badge bg-success-subtle text-success-emphasis rounded-pill me-2">LLP</span>
                                <h4 class="modal-subtitle">{{ singleModal.llp_domain }}</h4>
                                <p class="modal-text">{{ singleModal.llp_title }}</p>

                                <slot name="slotSingleModal2"></slot>

                            </div>
                            
                            <hr>
                            <h5 class="mt-4 aboutSchool">About the School</h5>

                            <slot name="slotSingleModal3"></slot>

                        </div>

                        <div class="modal-footer">
                            <slot name="slotSingleModal4"></slot>

                        </div>
                    </div>
                </div>
            </div>
            
        <div class="modal-backdrop fade show"></div>

</template>

<style scoped>
    .modal-subtitle{
    font-size: 16px; 
    font-weight: 600; 
    color: #374151; 
    margin-top: 0.25rem;
    }

    .modal-text{
        font-size: 14px; 
        color: #4b5563;
    }
</style>