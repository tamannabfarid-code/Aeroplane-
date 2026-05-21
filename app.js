// ========== FLEET DATA: 4 MODELS WITH YOUR EXACT FILE NAMES ==========
// PNG icons: artemis class biplane-plane.png, artemis g-6 interceptor-plane.png, 
//            f-22 raptor-plane.png, nomad skycar-plane.png
// 3D models: artemis class biplane.glb, artemis g-6 interceptor.glb, 
//            f-22 raptor.glb, nomad skycar.glb

const fleetData = [
  {
    id: "artemis_biplane",
    name: "Artemis Class Biplane",
    shortName: "Artemis Biplane",
    manufacturer: "Artemis Aeronautics",
    type: "Vintage Biplane",
    role: "Reconnaissance / Acrobatic",
    speed: "145 mph",
    passengerCapacity: "2",
    cost: "$ 127K",
    modelFile: "artemis class biplane.glb",
    iconFile: "artemis class biplane-plane.png",
    fuelRequired: "42 gal",
    flightDistance: "390 nmi",
    twr: "0.09:1",
    ceiling: "14.5k ft"
  },
  {
    id: "artemis_interceptor",
    name: "Artemis G-6 Interceptor",
    shortName: "G-6 Interceptor",
    manufacturer: "Artemis Defense",
    type: "Interceptor",
    role: "Air Superiority",
    speed: "Mach 1.9",
    passengerCapacity: "1",
    cost: "$ 42.5M",
    modelFile: "artemis g-6 interceptor.glb",
    iconFile: "artemis g-6 interceptor-plane.png",
    fuelRequired: "185 gal",
    flightDistance: "1250 nmi",
    twr: "0.94:1",
    ceiling: "54k ft"
  },
  {
    id: "f22_raptor",
    name: "F-22 Raptor",
    shortName: "F-22 Raptor",
    manufacturer: "Lockheed Martin",
    type: "Stealth Air Dominance",
    role: "5th Gen Fighter",
    speed: "Mach 2.25",
    passengerCapacity: "1",
    cost: "$ 150M",
    modelFile: "f-22 raptor.glb",
    iconFile: "f-22 raptor-plane.png",
    fuelRequired: "280 gal",
    flightDistance: "1839 nmi",
    twr: "1.09:1",
    ceiling: "65k ft"
  },
  {
    id: "nomad_skycar",
    name: "Nomad Skycar",
    shortName: "Nomad Skycar",
    manufacturer: "Nomad Aviation",
    type: "Personal eVTOL",
    role: "Urban Air Mobility",
    speed: "180 mph",
    passengerCapacity: "4",
    cost: "$ 289K",
    modelFile: "nomad skycar.glb",
    iconFile: "nomad skycar-plane.png",
    fuelRequired: "28 gal",
    flightDistance: "250 nmi",
    twr: "0.21:1",
    ceiling: "12k ft"
  }
];

const MODEL_BASE_PATH = "./";
const ICON_BASE_PATH = "./";

function getModelPath(modelFile) { return MODEL_BASE_PATH + modelFile; }
function getIconPath(iconFile) { return ICON_BASE_PATH + iconFile; }

// DOM elements
let currentSelectedPlaneId = fleetData[0].id;
let isTransitioning = false;

const modelViewer = document.getElementById('aircraft-viewer');
const cardPreviewImg = document.getElementById('cardPreviewImg');
const planeNameDisplay = document.getElementById('planeNameDisplay');
const specGridContainer = document.getElementById('specGridContainer');
const modelsGrid = document.getElementById('modelsGridCenter');
const confirmBtn = document.getElementById('confirmSelectionBtn');
const modelStatusSpan = document.getElementById('modelStatus');
const fuelValueSpan = document.getElementById('fuelValue');
const distanceValueSpan = document.getElementById('distanceValue');
const twrValueSpan = document.getElementById('twrValue');
const ceilingValueSpan = document.getElementById('ceilingValue');
const rightPanel = document.getElementById('selectedPlaneCard');

// Helper: Handle image loading errors
function handleImageError(imgElement, fallbackName) {
  if (!imgElement.getAttribute('data-fallback-set')) {
    imgElement.setAttribute('data-fallback-set', 'true');
    imgElement.src = `https://placehold.co/400x300/1a2a3a/00d4ff?text=${encodeURIComponent(fallbackName || 'Aircraft')}`;
    console.warn(`Failed to load image for ${fallbackName}`);
  }
}

// Animation: 3D model slide effect
function animateModelSlide() {
  modelViewer.classList.remove('model-transition');
  void modelViewer.offsetWidth;
  modelViewer.classList.add('model-transition');
  setTimeout(() => modelViewer.classList.remove('model-transition'), 500);
}

// Animation: Right panel slide effect
function animateRightPanel() {
  rightPanel.classList.remove('panel-slide-tech');
  void rightPanel.offsetWidth;
  rightPanel.classList.add('panel-slide-tech');
  setTimeout(() => rightPanel.classList.remove('panel-slide-tech'), 400);
}

// Render right panel with plane data
function renderRightPanel(plane) {
  planeNameDisplay.textContent = plane.name;
  const iconPath = getIconPath(plane.iconFile);
  cardPreviewImg.src = iconPath;
  cardPreviewImg.onerror = () => handleImageError(cardPreviewImg, plane.name);
  
  fuelValueSpan.innerHTML = plane.fuelRequired;
  distanceValueSpan.innerHTML = plane.flightDistance;
  twrValueSpan.innerHTML = plane.twr;
  ceilingValueSpan.innerHTML = plane.ceiling;
  
  const specs = [
    { label: "MANUFACTURER", value: plane.manufacturer },
    { label: "TYPE", value: plane.type },
    { label: "ROLE", value: plane.role },
    { label: "MAX SPEED", value: plane.speed },
    { label: "PASSENGERS", value: plane.passengerCapacity },
    { label: "COST", value: plane.cost }
  ];
  
  specGridContainer.innerHTML = specs.map(spec => `
    <div class="spec-item-tech">
      <div class="spec-label-tech">${spec.label}</div>
      <div class="spec-value-tech">${spec.value}</div>
    </div>
  `).join('');
}

// Update 3D model with smooth loading
function updateModelForPlane(plane) {
  const modelPath = getModelPath(plane.modelFile);
  if (modelViewer.src === modelPath && modelViewer.loaded) {
    animateModelSlide();
    return;
  }
  
  modelStatusSpan.textContent = `🌀 UPLINK: ${plane.name}`;
  modelViewer.style.opacity = "0.7";
  modelViewer.src = modelPath;
  
  const onLoad = () => {
    modelViewer.style.opacity = "1";
    animateModelSlide();
    modelStatusSpan.textContent = `✅ ${plane.name} | ACTIVE`;
    setTimeout(() => {}, 1500);
    modelViewer.removeEventListener('load', onLoad);
  };
  
  const onError = () => {
    modelStatusSpan.textContent = `⚠️ MODEL OFFLINE: ${plane.modelFile}`;
    modelViewer.style.opacity = "1";
    modelViewer.removeEventListener('error', onError);
  };
  
  modelViewer.addEventListener('load', onLoad, { once: true });
  modelViewer.addEventListener('error', onError, { once: true });
}

// Set active plane with smooth slide transition
function setActivePlane(planeId) {
  if (isTransitioning) return;
  const plane = fleetData.find(p => p.id === planeId);
  if (!plane) return;
  
  isTransitioning = true;
  currentSelectedPlaneId = planeId;
  renderRightPanel(plane);
  updateModelForPlane(plane);
  updateActiveCard(planeId);
  animateRightPanel();
  
  const activeCard = document.querySelector(`.model-card-center[data-plane-id="${planeId}"]`);
  if (activeCard) {
    activeCard.classList.add('slide-in');
    setTimeout(() => activeCard.classList.remove('slide-in'), 450);
    activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  setTimeout(() => { isTransitioning = false; }, 550);
}

// Update active card highlight
function updateActiveCard(activeId) {
  document.querySelectorAll('.model-card-center').forEach(card => {
    if (card.getAttribute('data-plane-id') === activeId) {
      card.classList.add('active-card');
    } else {
      card.classList.remove('active-card');
    }
  });
}

// Build the 4 centered model cards
function buildModelsGrid() {
  modelsGrid.innerHTML = '';
  fleetData.forEach((plane, idx) => {
    const card = document.createElement('div');
    card.className = 'model-card-center';
    if (plane.id === currentSelectedPlaneId) card.classList.add('active-card');
    card.setAttribute('data-plane-id', plane.id);
    
    const img = document.createElement('img');
    img.className = 'model-icon-img';
    img.src = getIconPath(plane.iconFile);
    img.alt = plane.name;
    img.loading = 'eager';
    img.onerror = () => handleImageError(img, plane.name);
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'model-name';
    nameDiv.textContent = plane.shortName;
    
    const badge = document.createElement('div');
    badge.className = 'model-badge';
    badge.textContent = plane.type;
    
    card.appendChild(img);
    card.appendChild(nameDiv);
    card.appendChild(badge);
    
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      setActivePlane(plane.id);
    });
    
    modelsGrid.appendChild(card);
    
    // Entrance animation for cards
    setTimeout(() => {
      card.classList.add('slide-in');
      setTimeout(() => card.classList.remove('slide-in'), 500);
    }, idx * 80);
  });
}

// Confirm selection handler
confirmBtn.addEventListener('click', () => {
  const plane = fleetData.find(p => p.id === currentSelectedPlaneId);
  if (plane) {
    alert(`🚀 NEXUS COMMAND\n\n✈️ ${plane.name}\n⛽ FUEL: ${plane.fuelRequired}\n📡 RANGE: ${plane.flightDistance}\n⚡ T/W: ${plane.twr}\n🌡️ CEILING: ${plane.ceiling}\n\n📁 3D Model: ${plane.modelFile}\n🖼️ Icon: ${plane.iconFile}\n\nMISSION DEPLOYED.`);
  }
});

// Drag-to-scroll for carousel (optional - if you want drag on models grid)
function initDragScroll() {
  if (!modelsGrid) return;
  let isDown = false;
  let startX;
  let scrollLeft;
  
  modelsGrid.addEventListener('mousedown', (e) => {
    isDown = true;
    modelsGrid.style.cursor = 'grabbing';
    startX = e.pageX - modelsGrid.offsetLeft;
    scrollLeft = modelsGrid.scrollLeft;
  });
  modelsGrid.addEventListener('mouseleave', () => {
    isDown = false;
    modelsGrid.style.cursor = 'grab';
  });
  modelsGrid.addEventListener('mouseup', () => {
    isDown = false;
    modelsGrid.style.cursor = 'grab';
  });
  modelsGrid.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - modelsGrid.offsetLeft;
    const walk = (x - startX) * 1.2;
    modelsGrid.scrollLeft = scrollLeft - walk;
  });
  modelsGrid.style.cursor = 'grab';
}

// Initialize the application
function init() {
  buildModelsGrid();
  initDragScroll();
  
  if (fleetData.length > 0) {
    const defaultPlane = fleetData[0];
    currentSelectedPlaneId = defaultPlane.id;
    renderRightPanel(defaultPlane);
    updateModelForPlane(defaultPlane);
    updateActiveCard(defaultPlane.id);
    setTimeout(() => {
      const firstCard = document.querySelector(`.model-card-center[data-plane-id="${defaultPlane.id}"]`);
      if (firstCard) firstCard.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      animateRightPanel();
    }, 200);
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
