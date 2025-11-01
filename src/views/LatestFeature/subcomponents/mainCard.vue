<script>
    export default{
        props:{
            mainCard: {
                type: Object,
                required: true
            },
            isSaved: {
                type: Boolean,
                default: false
            },
            isCompareDisabled: {
                type: Boolean,
                default: false
            }
        },

        emits: ['compare-add', 'save-toggle', 'share-link'],
        data() {
            return {
                bookmarkIconOutline: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>`,
                bookmarkIconSolid: `<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z"></path></svg>`,
                shareIcon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12v8c0 1.1.9 2 2 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4 4V4"></path></svg>`,
                compareIcon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m6 5H4m0 0l4 4m-4-4l4-4"></path></svg>`
            }
        }
    }
</script>

<template>
    
    <div class="col">
        <div class="card h-100 d-flex flex-column">

            <div class="card-body flex-grow-1 ">
        
                <h3 class="card-title">{{mainCard.name}}</h3>
        
                <div class="cardContent">
                    <slot name="slotMainCard1"></slot>
                    <h4 class="card-subtitle">{{ mainCard.alp_domain }}</h4>
                    <p class="card-text">{{ mainCard.alp_title }}</p>
                </div>
        
                <div class="cardContent mt-4">
                    <slot name="slotMainCard2"></slot>
                    <h4 class="card-subtitle">{{ mainCard.llp_domain }}</h4>
                    <p class="card-text">{{ mainCard.llp_title }}</p>
                </div>
        
            </div>
            <div class="card-footer buttonsCard">
                <div class="d-flex align-items-center">
                    <!-- Compare Button -->
                    <button 
                        class="icon-btn" 
                        title="Add to Compare"
                        :disabled="isCompareDisabled"
                        @click.stop="$emit('compare-add')"
                        v-html="compareIcon">
                    </button>
                    <!-- Save Button -->
                    <button 
                        class="icon-btn" 
                        :class="{ 'active': isSaved }"
                        title="Save"
                        @click.stop="$emit('save-toggle')"
                        v-html="isSaved ? bookmarkIconSolid : bookmarkIconOutline">
                    </button>
                    <!-- Share Button -->
                    <button 
                        class="icon-btn" 
                        title="Share Link"
                        @click.stop="$emit('share-link')"
                        v-html="shareIcon">
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

    *{
        box-sizing: border-box;
    }

    .card {
        border: 1px solid #e5e7eb; 
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
        transition: box-shadow 0.3s ease;
    }

    .card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); 
    }

    .buttonsCard{
        display: flex;
        justify-content: flex-end; 
        background-color: #fff; 
        border-top: 1px solid #f3f4f6; 
        padding-top: 0.5rem;    
        padding-bottom: 0.5rem; 
        padding-right: 0.5rem;  
    }

    .card-body{
        padding: 24px;
        text-align: left;
    }

    .cardContent{
        display: inline-block;

    }

    .card-title {
        font-size: 20px;
        font-weight: 700;
        font-family: 'Inter', sans-serif; 
        color: #111827; 
        margin-bottom: 1rem;
    }

    .card-subtitle {
        font-size: 16px;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        color: #374151; 
        margin-top: 0.25rem;
        
    }

        
    .card-text {
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        color: #4b5563; 
        text-align: left;
    }


    .icon-btn {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px; 
        color: #6b7280; 
        background-color: transparent;
        border: none;
        transition: background-color 0.2s ease, color 0.2s ease;
    }


    .icon-btn:not(:disabled):hover {
        background-color: #f3f4f6; 
        color: #3b82f6; 
    }
    
    .icon-btn[title="Share Link"]:not(:disabled):hover {
        color: #10b981;
    }

    .icon-btn.active {
        color: #3b82f6; 
    }

    .icon-btn:disabled {
        color: #d1d5db;
        cursor: not-allowed;
    }

    .card-footer.buttonsCard button.icon-btn :deep(svg) {
        pointer-events: none;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }

    

</style>