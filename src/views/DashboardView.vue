<!-- Map Logic, School distance mapping logic -->
<script setup>
  import { useSchoolMap } from '../composables/useSchoolMap'

  const {
    homeAddress,
    source,
    destination,
    handleSubmit,
    setActiveInput,
    sourceInput,
    destinationInput,
    inputMsg
  } = useSchoolMap()
</script>

<style src="../styles/style.css"></style>

<template>
  <div>
  <header class="shadow-sm">
    <div class="d-flex justify-content-between align-items-center py-4">
      <h1 class="display-5 fw-bold mb-0">Dashboard</h1>
      <p class="text-muted small mb-0">Welcome! You are successfully logged in.</p>
    </div>
  </header>

    <main>
      <div class="contsiner py-5">
        <div class="p-5 mb-4 rounded-3">
          <div class="container-fluid py-5 text-center">
            <p class="fs-4">Welcome! You are successfully logged in.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- SchoolFinders (School distance mapping) from Nic -->
    <div class="container py-6">
      <h1 class="text-center mb-4">SchoolFinders</h1>
      <br>

      <div class="row">
        <div class="col-md-3">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="home" class="form-label">Where is your home?</label>
              <input
                v-model="homeAddress"
                type="text"
                id="home"
                name="home"
                class="form-control"
                placeholder="Key in your home address!"
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary mb-4"
            >
              Submit
            </button>
          </form>

          <div class="mb-3">
            <label for="source" class="form-label">Source</label>
            <input
              type="text"
              id="source"
              name="source"
              class="form-control"
              ref="sourceInput"
              v-model="source"
              @focus="setActiveInput('source')"
              placeholder="Choose a source!"
            />
          </div>
          <div class="mb-3">
            <label for="destination" class="form-label">Destination</label>
            <input
              type="text"
              id="destination"
              name="destination"
              class="form-control"
              ref="destinationInput"
              v-model="destination"
              @focus="setActiveInput('destination')"
              placeholder="Choose a destination!"
            />
          </div>
          <div
            id="inputMsg"
            ref="inputMsg"
            class="mt-3 d-flex justify-content-start align-items-center gap-3"
          ></div>
        </div>

        <div class="col-md-9 d-flex flex-column">
          <div
            id="map"
            class="flex-grow-1"
            style="height: 40rem; border-radius: 0.5rem; box-shadow: 0 5px 15px rgba(8, 66, 152, 0.3); background: #f0f7ff;"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

