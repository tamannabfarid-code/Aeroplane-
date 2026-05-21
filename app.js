// Complete vehicle collection specs matched to your exact naming rules
const fleetData = [
    {
        id: "biplane",
        name: "Artemis Class Biplane",
        vendor: "AeroClassics",
        type: "Classic Prop",
        role: "Sport / Transport",
        range: "350 miles",
        speed: "95 knots",
        capacity: "2",
        cost: "150,000 Credits",
        icon: "artemis class biplane-plane.png",
        model: "artemis class biplane.glb" // Exact .glb filename assignment
    },
    {
        id: "g6",
        name: "Artemis G-6 Interceptor",
        vendor: "Vanguard Aero",
        type: "Supersonic Jet",
        role: "Air Defense",
        range: "1,200 miles",
        speed: "Mach 1.6",
        capacity: "1",
        cost: "1,450,000 Credits",
        icon: "artemis g-6 interceptor-plane.png",
        model: "artemis g-6 interceptor.glb"
    },
    {
        id: "f22",
        name: "F-22 Raptor",
        vendor: "Lockheed Precision",
        type: "Stealth Fighter",
        role: "Tactical Superiority",
        range: "1,800 miles",
        speed: "Mach 2.25",
        capacity: "1",
        cost: "2,500,000 Credits",
        icon: "f-22 raptor-plane.png",
        model: "f-22 raptor.glb"
    },
    {
        id: "nomad",
        name: "Nomad Skycar",
        vendor: "Omni-Tech VTOL",
        type: "Quad-VTOL Car",
        role: "Personal Transport",
        range: "450 miles",
        speed: "210 knots",
        capacity: "4",
        cost: "850,000 Credits",
        icon: "nomad skycar-plane.png",
        model: "nomad skycar.glb"
    }
];

let activeIndex = 0;
const ribbon = document.getElementById('selector-ribbon');

// --- Three.js 3D Viewport Global Engine Variables ---
let scene, camera, renderer, modelGroup;
let loadedMeshes = {}; // Cache map container to keep loaded glb assets responsive
let targetX = 0; 
const slideSpeed = 0.08; 

// --- UI Framework Setup ---
function setupUI() {
    fleetData.forEach((plane, index) => {
        const card = document.createElement('div');
        card.className = `plane-card ${index === 0 ? 'active' : ''}`;
        card.setAttribute('data-index', index);
        card.innerHTML = `
            <div class="card-icon">
                <img src="${plane.icon}" alt="${plane.name}" onerror="this.parentElement.style.background='rgba(0,0,0,0.05)'">
            </div>
            <p>${plane.name}</p>
        `;
        
        card.addEventListener('click', () => selectPlane(index));
        ribbon.appendChild(card);
    });
}

function selectPlane(index) {
    if(index === activeIndex) return;
    
    // Toggle active state ribbon styling highlights
    document.querySelectorAll('.plane-card').forEach((c, i) => {
        c.classList.toggle('active', i === index);
    });

    activeIndex = index;
    const data = fleetData[index];

    // Inject matching specs into the right panel UI layout
    document.getElementById('plane-title').innerText = data.name;
    document.getElementById('plane-thumb').src = data.icon;
    document.getElementById('plane-thumb').style.display = 'block'; 
    document.getElementById('val-vendor').innerText = data.vendor;
    document.getElementById('val-type').innerText = data.type;
    document.getElementById('val-role').innerText = data.role;
    document.getElementById('val-range').innerText = data.range;
    document.getElementById('val-speed').innerText = data.speed;
    document.getElementById('val-cap').innerText = data.capacity;
    document.getElementById('val-cost').innerText = data.cost;

    // Trigger the slide transition routine
    trigger3DTransition(data.model);
}

// --- Three.js Initialization Engine ---
function init3D() {
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f3f5); // Soft showroom clean studio gray

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding; // Ensures accurate model colors
    container.appendChild(renderer.domElement);

    // Dynamic Ambient/Studio Lights Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xaed6f1, 0.4);
    dirLight2.position.set(-5, 2, -5);
    scene.add(dirLight2);

    // Container Group targeting transitions
    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Start asynchronously loading files from data layout structures 
    preloadGLBModels();

    window.addEventListener('resize', onWindowResize);
    animate();
}

// Asynchronously parses files from your repo folder map pipeline using GLTFLoader
function preloadGLBModels() {
    const loader = new THREE.GLTFLoader();

    fleetData.forEach((plane, idx) => {
        loader.load(
            plane.model,
            (gltf) => {
                const modelScene = gltf.scene;

                // Center asset geometry roots automatically
                const box = new THREE.Box3().setFromObject(modelScene);
                const center = box.getCenter(new THREE.Vector3());
                modelScene.position.x += (modelScene.position.x - center.x);
                modelScene.position.y += (modelScene.position.y - center.y);
                modelScene.position.z += (modelScene.position.z - center.z);

                // Normalizes varying model scale properties to visual bounds
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const targetScale = 2.8 / maxDim; // Fits object nicely into context frame box
                modelScene.scale.set(targetScale, targetScale, targetScale);

                // Save model context frame target configuration to RAM cache map structure
                loadedMeshes[plane.model] = modelScene;

                // Instantly attach first plane object initialization to main render workspace group
                if (idx === 0) {
                    modelGroup.add(modelScene);
                }
            },
            (xhr) => {
                console.log(`${plane.name}: ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
            },
            (error) => {
                console.error(`Error loading model file ${plane.model}:`, error);
            }
        );
    });
}

function trigger3DTransition(modelKey) {
    modelGroup.position.x = 4.5; // Snap presentation group far off-screen right bound element
    
    // Wipe active group objects immediately
    while(modelGroup.children.length > 0){ 
        modelGroup.remove(modelGroup.children[0]); 
    }
    
    // Inject selected preloaded data mesh safely
    if(loadedMeshes[modelKey]) {
        modelGroup.add(loadedMeshes[modelKey]);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Continuous smooth turntable Y-axis rotation loop execution
    modelGroup.rotation.y += 0.006;

    // Linear interpolation tracking calculations (Slide-into-frame motion architecture)
    if (Math.abs(modelGroup.position.x - targetX) > 0.001) {
        modelGroup.position.x += (targetX - modelGroup.position.x) * slideSpeed;
    } else {
        modelGroup.position.x = targetX;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = () => {
    setupUI();
    init3D();
};
