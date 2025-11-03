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
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne2" aria-expanded="true" aria-controls="collapseOne">
                What is the Learning Learning Programme (ALP)?
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
    .accordion{
        margin-bottom: 25px;
        text-align: left;
    }
</style>