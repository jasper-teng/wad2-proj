<template>
  <div id="canvas-container" ref="containerRef" class="canvas-container"></div>

  <!-- Poster Preview Modal -->
  <div
    v-if="modal.visible"
    class="modal-backdrop"
    @click.self="closeModal"
  >
    <div class="modal-card" @mouseenter="insideModal = true" @mouseleave="onModalMouseleave">
      <button class="modal-close" @click="closeModal" aria-label="Close">✕</button>

      <div class="modal-icon" v-html="modal.app?.iconForcedBlack"></div>
      <h2 class="modal-title">{{ modal.app?.name }}</h2>
      <p class="modal-sub">{{ modal.app?.group }}</p>
      <p class="modal-desc">{{ modal.app?.description }}</p>

      <div class="modal-actions">
        <button class="btn primary" @click="openRoute(modal.app?.path)">Open</button>
        <button class="btn" @click="closeModal">Close</button>
      </div>
    </div>
  </div>

  <!-- Computer Input Modal -->
  <div
    v-if="pcModal.visible"
    class="modal-backdrop"
    @click.self="closePcModal"
  >
    <div class="modal-card" @mouseenter="insidePcModal = true" @mouseleave="onPcModalMouseleave">
      <button class="modal-close" @click="closePcModal" aria-label="Close">✕</button>

      <div class="modal-icon">
        <svg width="96" height="96" viewBox="0 0 24 24" fill="#111" aria-hidden="true">
          <path d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z"/>
        </svg>
      </div>
      <h2 class="modal-title">Assistant Console</h2>
      <p class="modal-sub">Type a query and press Enter</p>

      <div class="pc-input-row">
        <input
          ref="pcInputRef"
          v-model="chatInput"
          type="text"
          class="pc-input"
          placeholder="e.g. show GES"
          @keyup.enter="submitPcQuery"
        />
        <button class="btn primary" @click="submitPcQuery">Search</button>
        <button class="btn" @click="closePcModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const router = useRouter()

/* ---------------- Your app groups ---------------- */
const appGroups = ref([
  {
    name: 'School Comparison Tools',
    apps: [
      {
        name: 'School Comparison (Joes)',
        description: 'Compare schools side-by-side based on various criteria.',
        path: '/comparison',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-layout-split" viewBox="0 0 16 16"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5-1v12H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM7.5 2V14H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>`,
      },
      {
        name: 'School Comparer (Felicia)',
        description: 'Compare schools side-by-side based on various criteria.',
        path: '/school-comparer',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-layout-split" viewBox="0 0 16 16"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5-1v12H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM7.5 2V14H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>`,
      },
      {
        name: 'School CCA Comparison',
        description: 'CCA Comparison across all schools.',
        path: '/cca-finder',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-layout-split" viewBox="0 0 16 16"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5-1v12H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM7.5 2V14H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>`,
      },
      {
        name: 'Unique Programmes',
        description: 'Explore the unique programmes each school has.',
        path: '/distanceProgramme',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-layout-split" viewBox="0 0 16 16"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5-1v12H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM7.5 2V14H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>`,
      }
    ]
  },
  {
    name: 'Graduate Employment Survey (GES)',
    apps: [
      {
        name: 'Graduate Employment Survey',
        description: 'Explore GES statistics for local universities.',
        path: '/ges',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-mortarboard-fill" viewBox="0 0 16 16"><path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/><path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466z"/></svg>`,
      },
      {
        name: 'News Management',
        description: 'Upload, analyze, and manage news articles. Used for job sentiment analysis.',
        path: '/news',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-newspaper" viewBox="0 0 16 16"><path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5z"/><path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h2v1H7zm3 0h2v1h-2zM7 8h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2z"/></svg>`,
      },
    ],
  },
  {
    name: 'Distance Tracking Map',
    apps: [
      {
        name: 'Map Viewer',
        description: 'Visualize and track distances on an interactive map.',
        path: '/map',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>`
      },
    ],
  },
])

/* ---------------- Scene refs & state ---------------- */
const containerRef = ref(null)
let scene, camera, renderer, controls, clock, animationFrameId
let raycaster, mouse

// poster refs & layout
const POSTER_SIZE = { w: 3, h: 2 }
const POSTER_INNER = { w: 2.8, h: 1.8 }
const COLS = 4
const SPACING_X = 4.2
const SPACING_Y = 3.1
const START_Y = 8.5
const WALL_Z = -5.89
const POSTER_Z_OFFSET = 0.12
const CAMERA_Y_OFFSET = -1.0

// camera bounds (adaptive; set in frameCameraToGrid)
const cameraBounds = { minX: -10, maxX: 10, minY: 1, maxY: 12, minZ: WALL_Z + 0.6, maxZ: 30 }

// hover -> poster modal state
const modal = ref({ visible: false, app: null })
let hoverTimer = null
let hoveredGroup = null
let posters = []
const insideModal = ref(false)

// --- Computer (monitor) state ---
let pcScreenCanvas, pcScreenCtx, pcScreenTexture, pcGroup, pcFocused = false
let caretVisible = true
let caretTimer = null
const chatInput = ref('')

// --- Computer modal state ---
const pcModal = ref({ visible: false })
const insidePcModal = ref(false)
const pcInputRef = ref(null)

/* ---------- Navbar height handling ---------- */
function updateNavOffset () {
  // Use your global navbar (Bootstrap) actual height so the canvas sits below it
  const nav = document.querySelector('.navbar')
  const navH = nav?.offsetHeight || 56 // fallback for bootstrap default
  document.documentElement.style.setProperty('--nav-h', `${navH}px`)
  // Refit renderer to new available area
  onWindowResize()
}

onMounted(() => {
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  updateNavOffset()
  init()
  animate()
  window.addEventListener('resize', onWindowResize, { passive: true })
  // Also recompute navbar height on resize (collapse/expand can change height)
  window.addEventListener('resize', updateNavOffset, { passive: true })
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('resize', updateNavOffset)
  window.removeEventListener('keydown', onKeyDown)
  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('click', onCanvasClick)
    renderer.domElement.removeEventListener('mousemove', onCanvasMove)
  }
  if (caretTimer) clearInterval(caretTimer)
  controls?.dispose()
  if (scene) {
    scene.traverse(obj => {
      obj.geometry?.dispose?.()
      if (obj.material) {
        Array.isArray(obj.material)
          ? obj.material.forEach(m => m.dispose?.())
          : obj.material.dispose?.()
      }
    })
  }
  renderer?.dispose?.()
})

/* ---------------- Init / loop ---------------- */
function init () {
  clock = new THREE.Clock()
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e5ec)
  scene.fog = new THREE.Fog(0xe0e5ec, 15, 30)

  camera = new THREE.PerspectiveCamera(
    40,
    Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
    0.1,
    200
  )
  camera.position.set(0, 4.2, 14)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth || 1, container.clientHeight || 1)
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 5.5 + CAMERA_Y_OFFSET, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = false

  // Restrict movement
  controls.minDistance = 8
  controls.maxDistance = 24
  controls.minPolarAngle = Math.PI / 3.2
  controls.maxPolarAngle = Math.PI / 2.02
  controls.minAzimuthAngle = -Math.PI / 8
  controls.maxAzimuthAngle =  Math.PI / 8

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9)
  hemi.position.set(0, 20, 0)
  scene.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 0.65)
  dir.position.set(8, 12, 8)
  dir.castShadow = true
  dir.shadow.mapSize.set(2048, 2048)
  scene.add(dir)

  createFloorAndWall()

  // ----- Desk & chair flush to wall -----
  const desk = createTable()
  const wallZActual = WALL_Z - 0.08
  const DESK_DEPTH = 4
  const PULL_BACK = 1.75
  desk.position.set(0, 2, wallZActual + DESK_DEPTH / 2 + 0.01)
  scene.add(desk)

  const chair = createChair()
  chair.position.set(0, 1, desk.position.z + (DESK_DEPTH / 2 - 0.45))
  chair.rotation.y = Math.PI
  scene.add(chair)

  const nb = createNotebook()
  nb.position.set(-1.0, 2.13, desk.position.z + (DESK_DEPTH / 2 - 0.6) - PULL_BACK)
  nb.rotation.y = Math.PI / 10
  scene.add(nb)

  // ----- Computer on the table with interactive screen -----
  pcGroup = createComputer()
  pcGroup.position.set(0.5, 2.11, desk.position.z + (DESK_DEPTH / 2 - 0.9) - PULL_BACK)
  scene.add(pcGroup)

  // Posters
  buildPostersFromGroups(appGroups.value).then(() => {
    frameCameraToGrid()
  })

  // interactions
  renderer.domElement.addEventListener('click', onCanvasClick)
  renderer.domElement.addEventListener('mousemove', onCanvasMove)

  // caret blink for PC input
  caretTimer = setInterval(() => {
    caretVisible = !caretVisible
    renderPcScreen()
  }, 530)
}

function animate () {
  controls?.update?.()

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, cameraBounds.minX, cameraBounds.maxX)
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, cameraBounds.minY, cameraBounds.maxY)
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, cameraBounds.minZ, cameraBounds.maxZ)

  renderer?.render?.(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

/* ---------------- Camera framing ---------------- */
function frameCameraToGrid () {
  const cols = Math.min(COLS, posters.length || COLS)
  const rows = Math.ceil((posters.length || 1) / COLS)
  const gridW = (cols - 1) * SPACING_X + POSTER_SIZE.w
  const gridH = (rows - 1) * SPACING_Y + POSTER_SIZE.h
  const margin = 1.2

  const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight
  const vFov = THREE.MathUtils.degToRad(camera.fov)
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)

  const distW = (gridW * margin) / (2 * Math.tan(hFov / 2))
  const distH = (gridH * margin) / (2 * Math.tan(vFov / 2))
  const dist = Math.max(distW, distH)

  const centerYBase = START_Y - (Math.max(0, rows - 1) * SPACING_Y) / 2
  const centerY = centerYBase + CAMERA_Y_OFFSET
  controls.target.set(0, centerY, WALL_Z + 1)
  camera.position.set(0, centerY, WALL_Z + dist + 2)
  camera.updateProjectionMatrix()

  cameraBounds.minX = -gridW / 2 - 1.0
  cameraBounds.maxX =  gridW / 2 + 1.0
  cameraBounds.minY = Math.max(1, centerY - gridH / 2 - 1.0)
  cameraBounds.maxY = centerY + gridH / 2 + 3.0
  cameraBounds.minZ = WALL_Z + 0.6
  cameraBounds.maxZ = WALL_Z + dist + 8.0
}

/* ---------------- Events ---------------- */
function onWindowResize () {
  const c = containerRef.value
  if (!c || !camera || !renderer) return
  const w = Math.max(1, c.clientWidth)
  const h = Math.max(1, c.clientHeight)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  frameCameraToGrid()
}

function onCanvasMove (event) {
  if (!renderer || !camera || !scene) return
  if (modal.value.visible || pcModal.value.visible) return

  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(scene.children, true)

  // --- Hover: computer screen -> open PC modal
  const pcHit = hits.find(h => h.object?.userData?.pcScreen)
  if (pcHit) {
    if (hoveredGroup) { hoveredGroup.scale.set(1, 1, 1); hoveredGroup = null }
    if (hoverTimer) clearTimeout(hoverTimer)
    hoverTimer = setTimeout(() => {
      openPcModal()
    }, 220)
    return
  }

  // --- Hover: posters -> open poster modal
  const hitGroup = hits.find(h => h.object?.userData?.app || h.object?.parent?.userData?.app)
  const targetGroup = hitGroup ? (hitGroup.object.userData.groupRef || hitGroup.object.parent) : null

  if (targetGroup !== hoveredGroup) {
    if (hoveredGroup) hoveredGroup.scale.set(1, 1, 1)
    hoveredGroup = targetGroup
    if (hoverTimer) clearTimeout(hoverTimer)

    if (hoveredGroup) {
      hoveredGroup.scale.set(1.05, 1.05, 1.05)
      hoverTimer = setTimeout(() => {
        const app = hoveredGroup.userData.app
        openModal(app)
      }, 220)
    }
  }
}

function onCanvasClick (event) {
  if (!renderer || !camera || !scene) return
  if (modal.value.visible || pcModal.value.visible) return

  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(scene.children, true)
  if (!hits.length) return

  // 1) click on poster -> open modal
  const posterHit = hits.find(h => h.object?.userData?.app || h.object?.parent?.userData?.app)
  if (posterHit) {
    const group = posterHit.object.userData.groupRef || posterHit.object.parent
    openModal(group.userData.app)
    return
  }

  // 2) click on PC screen -> focus typing (existing behavior kept)
  const pcHit = hits.find(h => h.object?.userData?.pcScreen)
  if (pcHit) {
    pcFocused = true
    renderPcScreen()
    return
  }

  // click elsewhere -> blur pc
  pcFocused = false
  renderPcScreen()
}

/* ---------------- Keyboard input for PC chat (canvas focus) ---------------- */
function onKeyDown (e) {
  if (!pcFocused || modal.value.visible || pcModal.value.visible) return
  if (e.key === 'Escape') {
    pcFocused = false
    renderPcScreen()
    return
  }
  if (e.key === 'Enter') {
    pcFocused = false
    renderPcScreen()
    router.push('/ges') // mock search -> route
    return
  }
  if (e.key === 'Backspace') {
    chatInput.value = chatInput.value.slice(0, -1)
    renderPcScreen()
    return
  }
  if (e.key.length === 1) {
    chatInput.value += e.key
    renderPcScreen()
  }
}

/* ---------------- Poster Modal control ---------------- */
function openModal (app) {
  if (!app) return
  if (hoverTimer) clearTimeout(hoverTimer)
  controls.enabled = false
  document.body.style.overflow = 'hidden'
  modal.value = { visible: true, app }
}
function closeModal () {
  modal.value = { visible: false, app: null }
  controls.enabled = true
  document.body.style.overflow = ''
  if (hoveredGroup) hoveredGroup.scale.set(1, 1, 1)
  hoveredGroup = null
}
function onModalMouseleave () {
  if (!insideModal.value) return
  insideModal.value = false
  closeModal()
}

/* ---------------- PC Modal control ---------------- */
function openPcModal () {
  if (hoverTimer) clearTimeout(hoverTimer)
  controls.enabled = false
  document.body.style.overflow = 'hidden'
  pcModal.value = { visible: true }
  pcFocused = false // avoid double input targets
  renderPcScreen()
  nextTick(() => pcInputRef.value?.focus())
}
function closePcModal () {
  pcModal.value = { visible: false }
  controls.enabled = true
  document.body.style.overflow = ''
}
function onPcModalMouseleave () {
  if (!insidePcModal.value) return
  insidePcModal.value = false
  closePcModal()
}
function submitPcQuery () {
  closePcModal()
  router.push('/ges')
}

/* ---------------- Shared helpers ---------------- */
function openRoute (path) {
  closeModal()
  if (path) router.push(path)
}

/* ---------------- Builders ---------------- */
function createFloorAndWall () {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0xd1d9e6 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(50, 20, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xe0e5ec })
  )
  wall.position.set(0, 10, WALL_Z - 0.08)
  wall.receiveShadow = true
  wall.renderOrder = 1
  scene.add(wall)
}

function createTable () {
  const g = new THREE.Group()
  const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  const legMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.8 })
  const top = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 4), topMat)
  top.castShadow = true; top.receiveShadow = true; g.add(top)
  const legGeom = new THREE.BoxGeometry(0.2, 2, 0.2)
  ;[[-4.8,-1.8],[4.8,-1.8],[-4.8,1.8],[4.8,1.8]].forEach(([lx,lz])=>{
    const leg = new THREE.Mesh(legGeom, legMat)
    leg.position.set(lx,-1,lz); leg.castShadow = true; g.add(leg)
  })
  return g
}
function createChair () {
  const g = new THREE.Group()
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.5, metalness: 0.2 })
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 })
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2,0.2,2), seatMat)
  seat.castShadow = true; seat.receiveShadow = true; g.add(seat)
  const back = new THREE.Mesh(new THREE.BoxGeometry(2,2,0.2), seatMat)
  back.position.set(0,1.1,-0.9); back.castShadow = true; g.add(back)
  const legGeom = new THREE.CylinderGeometry(0.08,0.08,1.0,12)
  ;[[-0.9,-0.9],[0.9,-0.9],[-0.9,0.9],[0.9,0.9]].forEach(([lx,lz])=>{
    const leg = new THREE.Mesh(legGeom, legMat)
    leg.position.set(lx,-0.6,lz); leg.castShadow = true; g.add(leg)
  })
  return g
}
function createNotebook () {
  const g = new THREE.Group()
  const cover = new THREE.Mesh(new THREE.BoxGeometry(1.2,0.12,1.6), new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.6 }))
  cover.castShadow = true; g.add(cover)
  const pages = new THREE.Mesh(new THREE.BoxGeometry(1.12,0.1,1.52), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }))
  pages.position.y = 0.01; pages.castShadow = true; g.add(pages)
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.14,0.7), new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.4 }))
  strap.position.set(0.55,0.01,0); strap.castShadow = true; g.add(strap)
  return g
}

/* -------- Computer (monitor + base + keyboard-ish) -------- */
function createComputer () {
  const g = new THREE.Group()

  // Base stand
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.5, metalness: 0.3 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.2), standMat)
  base.castShadow = true; base.receiveShadow = true
  g.add(base)

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), standMat)
  neck.position.set(0, 0.45, -0.2)
  neck.castShadow = true
  g.add(neck)

  // Screen group
  const screenGroup = new THREE.Group()
  screenGroup.position.set(0, 1.2, 0)
  g.add(screenGroup)

  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 })
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 0.06), bezelMat)
  frame.castShadow = true
  screenGroup.add(frame)

  // Canvas screen
  pcScreenCanvas = document.createElement('canvas')
  pcScreenCanvas.width = 1024
  pcScreenCanvas.height = 600
  pcScreenCtx = pcScreenCanvas.getContext('2d')

  pcScreenTexture = new THREE.CanvasTexture(pcScreenCanvas)
  pcScreenTexture.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1

  const screenMat = new THREE.MeshBasicMaterial({ map: pcScreenTexture })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.7), screenMat)
  screen.position.z = 0.035
  screen.userData.pcScreen = true // for raycast focus & hover
  screenGroup.add(screen)

  // simple keyboard slab
  const kb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.9), new THREE.MeshStandardMaterial({ color: 0x2c2f31, roughness: 0.6 }))
  kb.position.set(0, 0.07, 0.9)
  kb.castShadow = true
  g.add(kb)

  renderPcScreen() // initial
  return g
}

function renderPcScreen () {
  if (!pcScreenCtx || !pcScreenTexture) return

  const W = pcScreenCanvas.width, H = pcScreenCanvas.height
  const grad = pcScreenCtx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#0f172a')
  grad.addColorStop(1, '#111827')
  pcScreenCtx.fillStyle = grad
  pcScreenCtx.fillRect(0, 0, W, H)

  pcScreenCtx.fillStyle = '#e5e7eb'
  pcScreenCtx.font = 'bold 42px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  pcScreenCtx.textAlign = 'left'
  pcScreenCtx.fillText('Assistant Console', 36, 64)

  pcScreenCtx.fillStyle = '#a7b0c0'
  pcScreenCtx.font = 'normal 24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  pcScreenCtx.fillText('Type a query and press Enter. (mock -> /ges)', 36, 110)

  const boxX = 36, boxY = 150, boxW = W - 72, boxH = 60, r = 12
  pcScreenCtx.fillStyle = '#0b1220'
  roundRect(pcScreenCtx, boxX, boxY, boxW, boxH, r); pcScreenCtx.fill()
  pcScreenCtx.strokeStyle = pcFocused ? '#60a5fa' : '#334155'
  pcScreenCtx.lineWidth = 2
  pcScreenCtx.stroke()

  pcScreenCtx.fillStyle = '#e5e7eb'
  pcScreenCtx.font = '600 26px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  const text = chatInput.value || ''
  pcScreenCtx.fillText(text, boxX + 16, boxY + 40)

  if (pcFocused && caretVisible) {
    const metrics = pcScreenCtx.measureText(text)
    const caretX = boxX + 16 + metrics.width + 2
    pcScreenCtx.fillRect(caretX, boxY + 18, 2, 28)
  }

  pcScreenCtx.fillStyle = '#a7b0c0'
  pcScreenCtx.font = 'normal 20px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  pcScreenCtx.fillText('Esc: blur input • Click screen to focus', 36, H - 30)

  pcScreenTexture.needsUpdate = true
}

/* -------- Posters generated from groups (black text + embedded SVG) -------- */
async function buildPostersFromGroups (groups) {
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.8 })
  const apps = []
  groups.forEach(g => g.apps.forEach(a => apps.push({
    ...a,
    group: g.name,
    iconForcedBlack: (a.icon || '').replace(/fill="currentColor"/g, 'fill="#111111"')
  })))

  posters = []
  const textures = await Promise.all(apps.map(makePosterTexture))

  textures.forEach((tex, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const group = new THREE.Group()

    const frame = new THREE.Mesh(new THREE.BoxGeometry(POSTER_SIZE.w, POSTER_SIZE.h, 0.1), frameMat)
    frame.renderOrder = 2
    group.add(frame)

    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(POSTER_INNER.w, POSTER_INNER.h),
      new THREE.MeshBasicMaterial({ map: tex })
    )
    poster.position.z = 0.051
    poster.material.depthTest = true
    poster.renderOrder = 3

    poster.userData.app = apps[i]
    poster.userData.groupRef = group
    group.userData.app = apps[i]

    group.add(poster)
    group.position.set(
      (-((COLS - 1) * SPACING_X) / 2) + col * SPACING_X,
      START_Y - row * SPACING_Y,
      WALL_Z + POSTER_Z_OFFSET
    )
    group.renderOrder = 2

    scene.add(group)
    posters.push(group)
  })
}

async function makePosterTexture (app) {
  const { name, description, iconForcedBlack } = app
  const W = 1024, H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#d0d4da'
  ctx.lineWidth = 8
  roundRect(ctx, 16, 16, W - 32, H - 32, 24); ctx.stroke()

  try {
    const img = await svgStringToImage(
      iconForcedBlack
        .replace(/class="[^"]*"/g, '')
        .replace(/width="[^"]*"/, 'width="128"')
        .replace(/height="[^"]*"/, 'height="128"')
    )
    const ICON_SIZE = 180
    ctx.drawImage(img, (W - ICON_SIZE) / 2, 120, ICON_SIZE, ICON_SIZE)
  } catch {
    ctx.fillStyle = '#111'; ctx.fillRect((W - 140) / 2, 150, 140, 140)
  }

  ctx.fillStyle = '#000'
  ctx.font = 'bold 48px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  wrapText(ctx, name || '', W / 2, 420, 820, 52)

  ctx.fillStyle = '#111'
  ctx.font = 'normal 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  wrapText(ctx, description || '', W / 2, 520, 860, 36)

  ctx.fillStyle = '#111'
  roundRect(ctx, W/2 - 120, H - 130, 240, 56, 12); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '600 26px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  ctx.fillText('Open', W / 2, H - 102)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1
  tex.needsUpdate = true
  return tex
}

/* ---------------- Canvas helpers ---------------- */
function roundRect (ctx, x, y, w, h, r) {
  const rr = Math.min(r, w/2, h/2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
function wrapText (ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/)
  let line = ''
  const lines = []
  words.forEach((w, i) => {
    const test = (line + w + ' ').trimEnd()
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      lines.push(line.trimEnd()); line = w + ' '
    } else {
      line = test + ' '
    }
  })
  lines.push(line.trimEnd())
  const total = lines.length * lineHeight
  let sy = y - total / 2 + lineHeight / 2
  lines.forEach(l => { ctx.fillText(l, x, sy); sy += lineHeight })
}
function svgStringToImage (svg) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}
</script>

<style scoped>
:root {
  /* updated dynamically at runtime by JS to match your .navbar height */
  --nav-h: 56px;
}

.canvas-container {
  position: fixed;
  /* Sit below your NavbarView.vue (rendered in App.vue) */
  top: var(--nav-h);
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  cursor: default;
  z-index: 0; /* Navbar is naturally above due to DOM position + Bootstrap z-index */
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 16, 18, 0.55);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  z-index: 9999;
}
.modal-card {
  position: relative;
  width: min(680px, 92vw);
  max-height: 86vh;
  overflow: auto;
  background: #fff;
  color: #111;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  padding: 28px 28px 24px;
}
.modal-close {
  position: absolute;
  top: 12px; right: 12px;
  border: 0;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #333;
}
.modal-icon :deep(svg) {
  display: block;
  margin: 6px auto 10px;
  width: 96px; height: 96px;
  fill: #111 !important;
}
.modal-title {
  margin: 6px 0 4px;
  font-size: 28px;
  font-weight: 800;
  text-align: center;
}
.modal-sub {
  margin: 0 0 14px;
  font-size: 14px;
  opacity: .7;
  text-align: center;
}
.modal-desc {
  margin: 0 auto 18px;
  max-width: 54ch;
  font-size: 16px;
  line-height: 1.6;
  text-align: center;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* PC Modal specific */
.pc-input-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
}
.pc-input {
  flex: 1 1 auto;
  max-width: 420px;
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #d0d4da;
  outline: none;
  font-size: 16px;
}
.pc-input:focus {
  border-color: #111;
}

.btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #d0d4da;
  background: #fff;
  color: #111;
  font-weight: 600;
  cursor: pointer;
}
.btn.primary {
  background: #111;
  color: #fff;
  border-color: #111;
}
.btn:hover { transform: translateY(-1px); }
</style>
