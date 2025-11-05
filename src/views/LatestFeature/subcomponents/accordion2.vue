<script>
    export default{
        props:['accordion2'],
        data(){
            return{
                name: "Learning for Life Programme",
                display_text_1: "The Learning for Life Programme (LLP) exposes students to a wide range of experiences to build their social-emotional competencies and to acquire sound values.",
                display_text_2: "LLP is intended to instill in students a sense of rootedness and responsibility for their community and fellow Singaporeans and an appreciation of aesthetics, sports and outdoor education.",
                categories: ["Community and Youth Leadership ", 'Music and Performing Arts / Visual Arts and Design ',"Sports and Outdoor Education"]
            }
        }

    }
</script>

<template>
    <div class="accordion" id="accordion2">
        <div class="accordion-item">
            <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne2" aria-expanded="false" aria-controls="collapseOne">
                What is the Learning for Life Programme (LLP)?
            </button>
            </h2>
            <div id="collapseOne2" class="accordion-collapse collapse" data-bs-parent="#accordion2">
                
            <div class="accordion-body">
                <p>{{ display_text_1 }}</p>
            </div>

            <div class="accordion-body">
                <p>{{ display_text_2 }}</p>
            </div>

            <div class="accordion-body">
                <strong>

                    Schools may offer ALP in areas like:
                </strong > 
                
                <ul v-for="cat in categories">
                    <li>{{ cat  }}</li>
                </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .accordion {
        margin-bottom: 25px;
        text-align: left;
    }

    .accordion-item {
        border: 3px solid #FFA18D;
        border-radius: 0 20px 0 20px;
        margin-bottom: 1rem;
        overflow: hidden;
    }

    .accordion-button {
        background-color: white;
        color: #313131;
        font-weight: 600;
        font-size: 1rem;
        padding: 1rem 1.25rem;
        border: none;
    }

    .accordion-button:not(.collapsed) {
        background-color: #FFA18D;
        color: white;
        box-shadow: none;
    }

    .accordion-button:focus {
        box-shadow: 0 0 0 0.25rem rgba(255, 161, 141, 0.25);
        border-color: #FFA18D;
    }

    .accordion-button::after {
        filter: brightness(0) saturate(100%);
    }

    .accordion-button:not(.collapsed)::after {
        filter: brightness(0) invert(1);
    }

    .accordion-body {
        padding: 1rem 1.25rem;
        background-color: white;
        color: #313131;
    }

    .accordion-body p {
        margin-bottom: 0.75rem;
        line-height: 1.6;
    }

    .accordion-body strong {
        color: #313131;
        font-weight: 600;
    }

    .accordion-body ul {
        margin-top: 0.5rem;
        padding-left: 1.5rem;
    }

    .accordion-body li {
        margin-bottom: 0.5rem;
        color: #313131;
    }

    .accordion-collapse {
        border-top: 2px solid #FFA18D;
    }
</style>