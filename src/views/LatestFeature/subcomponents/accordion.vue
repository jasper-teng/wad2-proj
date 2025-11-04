<script>
    export default{
        props:['accordion1'],
        data(){
            return{
                name: "Applied Learning Program",
                display_text_1: "The Applied Learning Programme (ALP) helps students connect academic knowledge and skills with the real world. It's intended to help students appreciate the relevance and value of what they are learning and to develop stronger motivation and purpose.",
                display_text_2: "ALP is non-examinable, and its emphasis is on the application of knowledge and thinking skills, stretching the imagination, and applying these to authentic settings in society and industries.",
                categories: ["Science, Technology, Engineering & Mathematics (STEM) (e.g., Cities and Urban Technology, Emerging Technologies, Future of Transportation, Health and Food Science, Sustainability)", 'Languages (e.g., Drama and Debate, Journalism and Broadcasting, Speech and Drama)',"Humanities (e.g., Digital Media, Field Studies, Media Literacy, Business and Entrepreneurship)","Aesthetics",'Interdisciplinary (e.g., Thinking Skills)']
            }
        }

    }
</script>

<template>
    <div class="accordion" id="accordion1">
        <div class="accordion-item">
            <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                What is the Applied Learning Programme (ALP)?
            </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordion1">
                
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