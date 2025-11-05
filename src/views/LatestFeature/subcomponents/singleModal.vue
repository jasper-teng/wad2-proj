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
    .modal-content {
        border: 5px solid #FFA18D;
        border-radius: 0 30px 0 30px;
        overflow: hidden;
    }

    .modal-header {
        background-color: #FFA18D;
        color: white;
        border-bottom: none;
        padding: 1.25rem 1.5rem;
    }

    .modal-title {
        font-weight: 700;
        font-size: 1.5rem;
        color: white;
    }

    .modal-header .btn-close {
        filter: brightness(0) invert(1);
        opacity: 0.9;
    }

    .modal-header .btn-close:hover {
        opacity: 1;
        transform: scale(1.1);
    }

    .modal-body {
        padding: 1.5rem;
        background-color: white;
    }

    .modal-subtitle {
        font-size: 16px;
        font-weight: 600;
        color: #313131;
        margin-top: 0.25rem;
    }

    .modal-text {
        font-size: 14px;
        color: #313131;
        line-height: 1.6;
    }

    .aboutSchool {
        font-size: 18px;
        font-weight: 600;
        color: #313131;
    }

    .modal-footer {
        background-color: #f8f9fa;
        border-top: 2px solid #FFA18D;
        padding: 1rem 1.5rem;
    }

    .modal-backdrop {
        backdrop-filter: blur(8px);
        background-color: rgba(0, 0, 0, 0.5);
    }

    .badge.bg-primary-subtle {
        background-color: #e0f2fe !important;
        color: #0369a1 !important;
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        font-size: 0.8rem;
    }

    .badge.bg-success-subtle {
        background-color: #dcfce7 !important;
        color: #16a34a !important;
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        font-size: 0.8rem;
    }

    hr {
        border-color: #FFA18D;
        opacity: 0.3;
        margin: 1.5rem 0;
    }

    /* Add animation for modal appearance */
    .modal.show {
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal-dialog {
        animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>