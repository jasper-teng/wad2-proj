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